/**
 * Telegram Webhook API
 * 
 * POST /api/telegram/webhook
 * Telegram Bot의 콜백 쿼리(승인/거부 버튼 클릭)를 처리합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramCallback } from '@/lib/executors';

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data: string; // "APPROVE|approval-id" or "REJECT|approval-id"
  };
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    // 콜백 쿼리가 아니면 무시
    if (!update.callback_query) {
      return NextResponse.json({ ok: true });
    }
    
    const { callback_query } = update;
    const [action, approvalId] = callback_query.data.split('|');
    
    if (!approvalId || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ ok: true, error: 'Invalid callback data' });
    }
    
    // 승인/거부 처리
    const result = handleTelegramCallback(
      approvalId,
      action as 'APPROVE' | 'REJECT'
    );
    
    // Telegram에 응답 (버튼 클릭 알림 제거)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      // 콜백 쿼리 응답
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: result.message,
          show_alert: true,
        }),
      });
      
      // 원본 메시지 수정
      if (callback_query.message) {
        const statusEmoji = action === 'APPROVE' ? '✅' : '❌';
        const statusText = action === 'APPROVE' ? '승인됨' : '거부됨';
        
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callback_query.message.chat.id,
            message_id: callback_query.message.message_id,
            text: `${statusEmoji} **${statusText}**\n\n처리자: @${callback_query.from.username || callback_query.from.first_name}\n승인 ID: \`${approvalId}\``,
            parse_mode: 'Markdown',
          }),
        });
      }
    }
    
    return NextResponse.json({ 
      ok: true, 
      result,
      action,
      approvalId,
    });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET - 웹훅 상태 확인
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is active',
    usage: 'POST with Telegram update object',
  });
}

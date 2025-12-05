/**
 * Approval Status API
 * 
 * GET /api/approval/status?id=approval-id
 * 승인 요청의 현재 상태를 확인합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApprovalStatus, pendingApprovals } from '@/lib/executors';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const approvalId = searchParams.get('id');
  
  if (!approvalId) {
    return NextResponse.json(
      { error: 'approval id is required' },
      { status: 400 }
    );
  }
  
  const status = getApprovalStatus(approvalId);
  
  return NextResponse.json({
    approvalId,
    ...status,
    timestamp: Date.now(),
  });
}

// 모든 대기 중인 승인 목록 (디버그용)
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (body.action === 'list') {
    const approvals: Record<string, unknown>[] = [];
    pendingApprovals.forEach((value, key) => {
      approvals.push({
        id: key,
        ...value,
      });
    });
    
    return NextResponse.json({
      count: approvals.length,
      approvals,
    });
  }
  
  // 수동으로 승인/거부 처리 (테스트용)
  if (body.action === 'approve' || body.action === 'reject') {
    const approval = pendingApprovals.get(body.approvalId);
    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }
    
    approval.status = body.action === 'approve' ? 'approved' : 'rejected';
    approval.userInput = body.userInput;
    pendingApprovals.set(body.approvalId, approval);
    
    return NextResponse.json({
      success: true,
      approvalId: body.approvalId,
      status: approval.status,
    });
  }
  
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}

// UI 테스트 스크립트
const { chromium } = require('playwright');

async function testUI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const baseUrl = 'https://3000-iqd1nb16897xibidtlow2-5c13a017.sandbox.novita.ai';
  
  console.log('🧪 조과장 UI 테스트 시작\n');
  
  try {
    // 1. 페이지 로드
    console.log('1️⃣ 페이지 로드 테스트...');
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    console.log(`   ✅ 제목: ${title}`);
    
    // 2. 사이드바 노드 목록 확인
    console.log('\n2️⃣ 노드 사이드바 테스트...');
    const nodeItems = await page.$$('.space-y-2 > div[draggable="true"]');
    console.log(`   ✅ 노드 개수: ${nodeItems.length}개`);
    
    // 노드 이름 추출
    const nodeNames = await page.$$eval('.space-y-2 > div[draggable="true"] .font-medium', 
      els => els.map(el => el.textContent));
    console.log(`   📦 노드 목록: ${nodeNames.join(', ')}`);
    
    // 3. 툴바 버튼 테스트
    console.log('\n3️⃣ 툴바 버튼 테스트...');
    const buttons = await page.$$('button');
    console.log(`   ✅ 버튼 개수: ${buttons.length}개`);
    
    // 저장 버튼
    const saveBtn = await page.$('button[title="워크플로우 저장"]');
    console.log(`   ${saveBtn ? '✅' : '❌'} 저장 버튼`);
    
    // 불러오기 버튼
    const loadBtn = await page.$('button[title="워크플로우 불러오기"]');
    console.log(`   ${loadBtn ? '✅' : '❌'} 불러오기 버튼`);
    
    // 초기화 버튼
    const clearBtn = await page.$('button[title="워크플로우 초기화"]');
    console.log(`   ${clearBtn ? '✅' : '❌'} 초기화 버튼`);
    
    // 실행 버튼
    const runBtn = await page.$('button:has-text("시켜!")');
    console.log(`   ${runBtn ? '✅' : '❌'} 실행 버튼`);
    
    // 4. 모드 전환 버튼
    console.log('\n4️⃣ 모드 전환 버튼 테스트...');
    const workflowBtn = await page.$('button[title="워크플로우 모드"]');
    const novelBtn = await page.$('button[title="소설 작성 모드"]');
    console.log(`   ${workflowBtn ? '✅' : '❌'} 워크플로우 모드 버튼`);
    console.log(`   ${novelBtn ? '✅' : '❌'} 소설 작성 모드 버튼`);
    
    // 5. 노드 클릭 테스트 (입력 노드 추가)
    console.log('\n5️⃣ 노드 추가 테스트...');
    const inputNodeBtn = await page.$('div[draggable="true"]:has-text("입력")');
    if (inputNodeBtn) {
      await inputNodeBtn.click();
      await page.waitForTimeout(500);
      console.log('   ✅ 입력 노드 클릭됨');
    }
    
    // 6. 캔버스 확인
    console.log('\n6️⃣ 캔버스 테스트...');
    const canvas = await page.$('.react-flow');
    console.log(`   ${canvas ? '✅' : '❌'} React Flow 캔버스 렌더링됨`);
    
    // 7. 노드 설정 패널 테스트
    console.log('\n7️⃣ 노드 설정 패널 테스트...');
    // 캔버스에서 노드 찾기
    await page.waitForTimeout(1000);
    const nodes = await page.$$('.react-flow__node');
    console.log(`   📍 캔버스의 노드 수: ${nodes.length}개`);
    
    if (nodes.length > 0) {
      await nodes[0].click();
      await page.waitForTimeout(500);
      const configPanel = await page.$('.w-80.bg-white.border-l');
      console.log(`   ${configPanel ? '✅' : '❌'} 설정 패널 표시됨`);
    }
    
    // 8. 최종 스크린샷
    console.log('\n8️⃣ 스크린샷 저장...');
    await page.screenshot({ path: '/home/user/webapp/ai-workflow-builder-ko/test-screenshot.png', fullPage: true });
    console.log('   ✅ test-screenshot.png 저장됨');
    
    console.log('\n✅✅✅ 모든 테스트 완료! ✅✅✅');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

testUI();

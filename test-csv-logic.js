
const csvData = `rcept_no,reprt_code,bsns_year,corp_code,stock_code,fs_div,fs_nm,sj_div,sj_nm,account_nm,thstrm_nm,thstrm_dt,thstrm_amount,frmtrm_nm,frmtrm_dt,frmtrm_amount,bfefrmtrm_nm,bfefrmtrm_dt,bfefrmtrm_amount,ord,currency
"20240312000736","11011","2023","00126380","005930","CFS","연결재무제표","BS","재무상태표","유동자산","제 55 기","2023.12.31 현재","224,583,077,000,000","제 54 기","2022.12.31 현재","218,470,581,000,000","제 53 기","2021.12.31 현재","218,163,185,000,000","1","KRW"
"20240312000736","11011","2023","00126380","005930","CFS","연결재무제표","BS","재무상태표","비유동자산","제 55 기","2023.12.31 현재","231,359,388,000,000","제 54 기","2022.12.31 현재","229,951,757,000,000","제 53 기","2021.12.31 현재","208,457,973,000,000","2","KRW"`;

function parseCSV(data) {
    if (typeof data === 'string' && data.includes(',')) {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
            // 첫 줄은 헤더
            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));

            // 나머지 줄은 데이터
            const rows = lines.slice(1).map(line => {
                const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const cells = matches.length > 0 ? matches : line.split(',');
                return cells.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
            });

            return { headers, rows, count: rows.length };
        }
    }
    return null;
}

const result = parseCSV(csvData);
console.log(JSON.stringify(result, null, 2));

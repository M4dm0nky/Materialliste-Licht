// ══════════════════════════════════════════════════
// PDF THEMES
// ══════════════════════════════════════════════════
const PDF_THEMES = [
  {
    id: 'standard',
    name: 'Standard (Dunkel)',
    fontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Bebas+Neue&display=swap',
    css: function(orient) {
      return [
        '*{box-sizing:border-box;margin:0;padding:0;}',
        "body{font-family:'IBM Plex Mono',monospace;font-size:8.5pt;color:#111;padding:14px;}",
        '.ph{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-bottom:2px solid #e8c84a;padding-bottom:10px;margin-bottom:14px;gap:8px;}',
        '.ph-left{display:flex;align-items:center;justify-content:flex-start;}',
        '.ph-center{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;}',
        '.ph-right{display:flex;align-items:center;justify-content:flex-end;}',
        ".pt{font-family:'Bebas Neue',sans-serif;font-size:26pt;letter-spacing:3px;color:#0d0f14;line-height:1;}",
        '.ps{font-size:7pt;color:#666;text-transform:uppercase;letter-spacing:.1em;margin-top:2px;}',
        '.pd{font-size:7.5pt;color:#e8c84a;text-align:right;}',
        'table{width:100%;border-collapse:collapse;margin-top:2px;}',
        'thead th{background:#0d0f14;color:#e8c84a;padding:5px 7px;text-align:left;font-size:7pt;text-transform:uppercase;letter-spacing:.08em;border:1px solid #2a3050;}',
        'thead th:nth-child(n+3){text-align:center;}',
        ".grp-hdr td{background:#e8c84a;color:#0d0f14;font-family:'Bebas Neue',sans-serif;font-size:11pt;letter-spacing:3px;padding:5px 10px;border-top:2px solid #c9a800;}",
        ".sec-hdr td{background:#1c2030;color:#e8c84a;font-family:'Bebas Neue',sans-serif;font-size:10pt;letter-spacing:2px;padding:5px 8px;border-top:1px solid #2a3050;border-bottom:1px solid #2a3050;}",
        ".pos-hdr td{background:#000;color:#000;font-family:'Bebas Neue',sans-serif;font-size:18pt;letter-spacing:5px;padding:14px 10px;text-align:center;border:3px solid #000;box-shadow:inset 0 0 0 4px #e8c84a;}",
        '.pos-hdr td span{background:#e8c84a;color:#000;padding:6px 28px;display:inline-block;}',
        'tbody.cat-group{page-break-inside:avoid;}',
        'tbody tr{border-bottom:1px solid #e8e8e8;}',
        'tbody tr.filled{background:#f8fdf9;}',
        '.ntd{padding:4px 7px;font-size:8pt;}',
        '.ntd2{padding:4px 7px;font-size:8pt;text-align:center;}',
        ".ltd{padding:4px 7px;font-size:7.5pt;font-family:'IBM Plex Mono',monospace;color:#555;white-space:nowrap;}",
        '.ktd{padding:4px 7px;font-size:7.5pt;color:#888;}',
        '.np{margin-top:14px;padding:8px;background:#fffbe6;border:1px solid #e8c84a;font-size:8pt;color:#333;border-radius:3px;}',
        '@media print{body{padding:5px;}.np{display:none!important;}@page{size:A4 ' + orient + ';margin:8mm;}}'
      ].join('\n');
    }
  }
];

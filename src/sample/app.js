
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const aqLevels = [
  {v:0,  label:'320 kbps (cao nhất)'},
  {v:5,  label:'160 kbps'},
  {v:6,  label:'128 kbps (khuyến nghị)'},
  {v:7,  label:'112 kbps'},
  {v:9,  label:'64 kbps (nhẹ nhất)'}
];

// build quality pills
const aqWrap = $('#aq');
aqLevels.forEach(({v,label})=>{
  const el = document.createElement('label');
  el.className = 'pill' + (v===6 ? ' active':'' );
  el.innerHTML = `<input type="radio" name="aq" value="${v}" ${v===6?'checked':''}>${label}`;
  el.addEventListener('click', ()=>{
    $$('#aq .pill').forEach(p=>p.classList.remove('active'));
    el.classList.add('active');
  });
  aqWrap.appendChild(el);
});

// presets
const setTpl = (v) => { $('#template').value = v; };
$('#presetSimple').onclick   = ()=> setTpl('%(title)s [%(id)s].%(ext)s');
$('#presetUploader').onclick = ()=> setTpl('%(uploader)s - %(title)s [%(id)s].%(ext)s');
$('#presetTitleDate').onclick= ()=> setTpl('%(title)s [%(upload_date>%Y-%m-%d)s].%(ext)s');
$('#presetDated').onclick    = ()=> setTpl('%(title)s [%(id)s] [%(upload_date>%Y-%m-%d)s].%(ext)s');
$('#presetPlaylist').onclick = ()=> setTpl('%(playlist_title)s/%(playlist_index)03d - %(title)s [%(id)s].%(ext)s');

// load/save state
const fields = ['url','cookies','outdir','archive','template','shell'];
function save(){
  const data = Object.fromEntries(fields.map(id=>[id, $("#"+id).value]));
  data.embedThumb = $('#embedThumb').checked; data.embedMeta = $('#embedMeta').checked; data.noPlaylist = $('#noPlaylist').checked;
  data.aq = document.querySelector('input[name="aq"]:checked')?.value ?? '6';
  localStorage.setItem('ytdlp-cmd-builder', JSON.stringify(data));
}
function load(){
  const raw = localStorage.getItem('ytdlp-cmd-builder');
  if(!raw) return; 
  try{ const data = JSON.parse(raw);
    fields.forEach(id=>{ if(data[id]!==undefined) $("#"+id).value = data[id]; });
    $('#embedThumb').checked = !!data.embedThumb; $('#embedMeta').checked = !!data.embedMeta; $('#noPlaylist').checked = !!data.noPlaylist;
    if(data.aq){ const pill = document.querySelector(`#aq .pill input[value="${data.aq}"]`)?.parentElement; if(pill){ $$('#aq .pill').forEach(p=>p.classList.remove('active')); pill.classList.add('active'); pill.firstChild.checked=true; } }
  }catch(e){}
}
load();

// URL warning & helpers
function showUrlWarning(msg, opts){
  const box = $('#urlWarning');
  box.innerHTML = `<div>${msg}</div>`;
  const actions = document.createElement('div');
  actions.className = 'actions';
  if(opts?.useVideo){
    const b = document.createElement('button');
    b.className = 'btn useVideo';
    b.textContent = 'Chỉ tải VIDEO này';
    b.onclick = ()=>{ $('#noPlaylist').checked = true; box.hidden = true; };
    actions.appendChild(b);
  }
  if(opts?.usePlaylist){
    const b = document.createElement('button');
    b.className = 'btn useList';
    b.textContent = 'Tải cả PLAYLIST';
    b.onclick = ()=>{
      try{
        const u = new URL($('#url').value.trim());
        const list = u.searchParams.get('list');
        if(list){ $('#url').value = `https://www.youtube.com/playlist?list=${list}`; $('#noPlaylist').checked = false; }
      }catch{}
      box.hidden = true;
    };
    actions.appendChild(b);
  }
  box.appendChild(actions);
  box.hidden = false;
}

function analyzeUrl(raw){
  try{
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./,'');
    const p = u.searchParams;
    if(host.includes('youtube.com')){
      const hasV = p.has('v');
      const hasList = p.has('list');
      if(hasV && hasList){
        showUrlWarning('URL chứa cả tham số video (v=…) và playlist (list=…). Hãy chọn 1 cách xử lý:', {useVideo:true, usePlaylist:true});
        return {ok:false, reason:'ambiguous'};
      }
    }
  }catch{ /* ignore */ }
  $('#urlWarning').hidden = true;
  return {ok:true};
}

// Clipboard helpers
async function pasteInto(id){
  try{
    const text = await navigator.clipboard.readText();
    if(text){ $("#"+id).value = text.trim(); $('#status').textContent = 'Đã dán từ clipboard'; save(); }
  }catch{ $('#status').textContent = 'Không đọc được clipboard (trình duyệt chặn quyền?)'; }
}
$('#pasteUrl').onclick = ()=> pasteInto('url');
$('#pasteCookies').onclick = ()=> pasteInto('cookies');
$('#pasteOutdir').onclick = ()=> pasteInto('outdir');

// File System Access API (progressive enhancement)
// ...existing code...

// Clean URL extra params helper
$('#cleanUrl').onclick = ()=>{
  try{
    const raw = $('#url').value.trim();
    const u = new URL(raw);
    const p = u.searchParams;
    if(p.has('v')){
      $('#url').value = `https://www.youtube.com/watch?v=${p.get('v')}`;
      $('#noPlaylist').checked = true; // nếu user làm sạch về video
    } else if(p.has('list')){
      $('#url').value = `https://www.youtube.com/playlist?list=${p.get('list')}`;
      $('#noPlaylist').checked = false;
    }
    $('#urlWarning').hidden = true;
    $('#status').textContent = 'Đã làm sạch URL';
  }catch{ $('#status').textContent = 'URL không hợp lệ để làm sạch.'; }
};

function build(){
  const url = $('#url').value.trim();
  const cookies = $('#cookies').value.trim();
  const outdir = $('#outdir').value.trim();
  const shell  = $('#shell').value;
  const aq     = document.querySelector('input[name="aq"]:checked')?.value || '6';
  const embedThumb = $('#embedThumb').checked;
  const embedMeta  = $('#embedMeta').checked;
  const noPlaylist = $('#noPlaylist').checked;
  const archive    = $('#archive').value.trim();
  let template = $('#template').value.trim();

  if(!url){ $('#status').textContent = 'Vui lòng nhập URL'; return; }
  const analyzed = analyzeUrl(url);
  if(!analyzed.ok){ $('#status').textContent = 'URL mơ hồ: chọn xử lý ở khung cảnh báo hoặc bấm “Làm sạch”.'; return; }
  if(!cookies){ $('#status').textContent = 'Vui lòng nhập đường dẫn cookies.txt'; return; }
  if(!template){ template = '%(title)s [%(id)s].%(ext)s'; }

  const parts = [];
  parts.push('yt-dlp');
  // cookies
  if(shell==='powershell'){
    parts.push(`--cookies "${cookies}"`);
  }else{
    parts.push(`--cookies '${cookies.replaceAll("'","'\''")}'`);
  }
  // audio extract
  parts.push('-x');
  parts.push('--audio-format mp3');
  parts.push(`--audio-quality ${aq}`);
  if(embedThumb) parts.push('--embed-thumbnail');
  if(embedMeta)  parts.push('--embed-metadata');
  if(noPlaylist) parts.push('--no-playlist');
  if(outdir){
    if(shell==='powershell') parts.push(`-P "${outdir}"`); else parts.push(`-P '${outdir.replaceAll("'","'\''")}'`);
  }
  if(archive){
    if(shell==='powershell') parts.push(`--download-archive "${archive}"`); else parts.push(`--download-archive '${archive.replaceAll("'","'\''")}'`);
  }
  // template
  if(shell==='powershell') parts.push(`-o "${template.replaceAll('"','\"')}"`); else parts.push(`-o '${template.replaceAll("'","'\''")}'`);
  // URL
  if(shell==='powershell') parts.push(`"${url}"`); else parts.push(`'${url.replaceAll("'","'\''")}'`);

  // join with line breaks
  const joiner = (shell==='powershell') ? ' `\n' : ' \\\n';
  const first  = parts.shift();
  const cmd = first + joiner + parts.join(joiner);
  $('#output').textContent = cmd;
  $('#status').textContent = 'Đã sinh lệnh';
  save();
}

$('#gen').onclick = build;
$('#copy').onclick = async ()=>{
  const s = $('#output').textContent; if(!s) return;
  await navigator.clipboard.writeText(s);
  $('#status').textContent = 'Đã sao chép vào clipboard';
};
$('#reset').onclick = ()=>{
  ['url','cookies','outdir','archive','template'].forEach(id=>$("#"+id).value='');
  $('#embedThumb').checked = true; $('#embedMeta').checked = true; $('#noPlaylist').checked = false;
  $$('#aq .pill').forEach(p=>p.classList.remove('active'));
  const def = document.querySelector('#aq .pill input[value="6"]').parentElement; def.classList.add('active'); def.firstChild.checked = true;
  $('#shell').value = 'powershell';
  $('#output').textContent = '# Lệnh sẽ xuất hiện ở đây…';
  $('#status').textContent = 'Đã đặt lại';
  $('#urlWarning').hidden = true; $('#urlWarning').innerHTML = '';
  save();
};

// auto-save on change
['url','cookies','outdir','archive','template','shell','embedThumb','embedMeta','noPlaylist'].forEach(id=>{
  const el = document.getElementById(id) || document.querySelector(`[name=${id}]`);
  if(el) el.addEventListener('change', ()=>{ save(); });
});
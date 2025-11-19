// Data model
const state = {
  personal: {},
  fotoDataUrl: null,
  educations: [],
  experiences: [],
  skills: []
};

/* Helpers to create input blocks for dynamic lists */
function createEducationBlock(index, data = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'edu-block';
  wrap.dataset.index = index;
  wrap.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <input placeholder="Institusi (mis: Universitas Pamulang)" class="edu-inst" value="${data.institution||''}" />
      <input placeholder="Tahun (mis: 2023)" class="edu-year" value="${data.year||''}" style="width:110px" />
      <button class="btn-outline btn-remove-edu">Hapus</button>
    </div>
  `;
  wrap.querySelector('.btn-remove-edu').addEventListener('click', () => {
    const idx = parseInt(wrap.dataset.index);
    state.educations.splice(idx,1);
    renderEducationList();
  });
  return wrap;
}
function createExperienceBlock(index,data={}) {
  const wrap = document.createElement('div');
  wrap.className = 'exp-block';
  wrap.dataset.index = index;
  wrap.innerHTML = `
    <div style="margin-bottom:8px">
      <input placeholder="Posisi / Jabatan" class="exp-role" value="${data.role||''}" style="width:48%;margin-right:8px"/>
      <input placeholder="Perusahaan" class="exp-company" value="${data.company||''}" style="width:48%"/>
      <div style="display:flex;gap:8px;margin-top:6px">
        <input placeholder="Periode (mis: Jan 2020 - Des 2021)" class="exp-period" value="${data.period||''}" style="flex:1" />
        <button class="btn-outline btn-remove-exp">Hapus</button>
      </div>
      <textarea placeholder="Deskripsi / tanggung jawab" class="exp-desc" rows="2" style="width:100%;margin-top:8px">${data.description||''}</textarea>
    </div>
  `;
  wrap.querySelector('.btn-remove-exp').addEventListener('click', () => {
    const idx = parseInt(wrap.dataset.index);
    state.experiences.splice(idx,1);
    renderExperienceList();
  });
  return wrap;
}
function createSkillBlock(index, data={}) {
  const wrap = document.createElement('div');
  wrap.className = 'skill-block';
  wrap.dataset.index = index;

  // daftar level teks
  const levelOptions = ["Pemula","Menengah","Terampil","Berpengalaman","Ahli"];
  let optionsHtml = levelOptions.map(l => 
    `<option value="${l}" ${data.level===l?'selected':''}>${l}</option>`).join('');

  wrap.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
      <input placeholder="Keahlian (mis: HTML, Communication)" class="skill-name-input" value="${data.name||''}" style="flex:1" />
      <select class="skill-level-input" style="width:150px">
        ${optionsHtml}
      </select>
      <button class="btn-outline btn-remove-skill">Hapus</button>
    </div>
  `;

  wrap.querySelector('.btn-remove-skill').addEventListener('click', () => {
    const idx = parseInt(wrap.dataset.index);
    state.skills.splice(idx,1);
    renderSkillList();
  });

  return wrap;
}

/* Render dynamic lists */
function renderEducationList(){
  const list = document.getElementById('edu-list');
  list.innerHTML = '';
  state.educations.forEach((edu, idx) => {
    const node = createEducationBlock(idx, edu);
    list.appendChild(node);
  });
}
function renderExperienceList(){
  const list = document.getElementById('exp-list');
  list.innerHTML = '';
  state.experiences.forEach((exp, idx) => {
    const node = createExperienceBlock(idx, exp);
    list.appendChild(node);
  });
}
function renderSkillList(){
  const list = document.getElementById('skill-list');
  list.innerHTML = '';
  state.skills.forEach((sk, idx) => {
    const node = createSkillBlock(idx, sk);
    list.appendChild(node);
  });
}

/* Step navigation */
const stepButtons = document.querySelectorAll('.step-btn');
const steps = document.querySelectorAll('.step');

function goToStep(n){
  steps.forEach(s => s.classList.remove('active'));
  document.getElementById('step-'+n).classList.add('active');
  stepButtons.forEach(b => b.classList.remove('active'));
  document.querySelector(`.step-btn[data-step="${n}"]`).classList.add('active');
}
stepButtons.forEach(btn => {
  btn.addEventListener('click', ()=> {
    const s = btn.dataset.step;
    goToStep(s);
  });
});

/* next / prev controls */
document.querySelectorAll('.next').forEach(btn => {
  btn.addEventListener('click', () => {
    const cur = Array.from(steps).findIndex(s => s.classList.contains('active'));
    const nextIdx = Math.min(steps.length-1, cur+1);
    goToStep(nextIdx+1);
  });
});
document.querySelectorAll('.prev').forEach(btn => {
  btn.addEventListener('click', () => {
    const cur = Array.from(steps).findIndex(s => s.classList.contains('active'));
    const prevIdx = Math.max(0, cur-1);
    goToStep(prevIdx+1);
  });
});

/* add default blocks and handlers */
document.getElementById('add-edu').addEventListener('click', () => {
  state.educations.push({institution:'',year:''});
  renderEducationList();
});
document.getElementById('add-exp').addEventListener('click', () => {
  state.experiences.push({role:'',company:'',period:'',description:''});
  renderExperienceList();
});
document.getElementById('add-skill').addEventListener('click', () => {
  state.skills.push({name:'',level:3});
  renderSkillList();
});

// add one default for UX
state.educations.push({institution:'',year:''});
state.experiences.push({role:'',company:'',period:'',description:''});
state.skills.push({name:'',level:4});
renderEducationList(); renderExperienceList(); renderSkillList();

/* Foto upload */
document.getElementById('inp-foto').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    state.fotoDataUrl = r.result;
  };
  r.readAsDataURL(f);
});

/* On Preview Generate - read all inputs and build preview */
document.getElementById('btn-generate').addEventListener('click', () => {
  // read personal
  state.personal.name = document.getElementById('inp-nama').value || '';
  state.personal.email = document.getElementById('inp-email').value || '';
  state.personal.phone = document.getElementById('inp-telp').value || '';
  state.personal.address = document.getElementById('inp-alamat').value || '';
  state.personal.link = document.getElementById('inp-link').value || '';
  state.personal.profile = document.getElementById('inp-profil').value || '';

  if (!state.personal.name || !state.personal.email) {
    alert('Nama dan Email wajib diisi!');
    goToStep(1);
    return;
  }

  // read educations
  const eduBlocks = document.querySelectorAll('.edu-block');
  state.educations = Array.from(eduBlocks).map(n => ({
    institution: n.querySelector('.edu-inst').value || '',
    year: n.querySelector('.edu-year').value || ''
  }));

  // read experiences
  const expBlocks = document.querySelectorAll('.exp-block');
  state.experiences = Array.from(expBlocks).map(n => ({
    role: n.querySelector('.exp-role').value || '',
    company: n.querySelector('.exp-company').value || '',
    period: n.querySelector('.exp-period').value || '',
    description: n.querySelector('.exp-desc').value || ''
  }));

  // read skills
  const skillBlocks = document.querySelectorAll('.skill-block');
  state.skills = Array.from(skillBlocks).map(n => ({
    name: n.querySelector('.skill-name-input').value || '',
    level: n.querySelector('.skill-level-input').value || 'Pemula' 
  }));

  // build preview HTML
  buildPreview();
  // show download button
  document.getElementById('btn-download').style.display = 'inline-block';
  document.getElementById('btn-edit').style.display = 'inline-block';
  // go to preview (step 5 is active)
  goToStep(5);
});

/* Build preview function */
function buildPreview() {
  const cv = document.getElementById('cv-preview');
  cv.innerHTML = ''; // reset

  // create main CV container
  const div = document.createElement('div');
  div.className = 'cv';
  div.innerHTML = `
    <div class="banner"></div>
    <div class="photo-wrap">
      <img id="photo-img" src="${state.fotoDataUrl || ''}" alt="Foto" onerror="this.style.display='none'"/>
    </div>

    <div class="name">${state.personal.name || ''}</div>

    <div class="content">
      <div class="col-left">
        <div class="section">
          <h4><span class="accent"></span> PROFIL</h4>
          <p>${(state.personal.profile || '').replace(/\n/g,'<br>')}</p>
        </div>

        <div class="section">
          <h4><span class="accent"></span> KONTAK</h4>
          <div class="contact-row">
            <div class="contact-item"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21 15.46l-5.27-.61..."></path></svg> ${state.personal.phone || '-'}</div>
            <div class="contact-item"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79..."></path></svg> ${state.personal.email}</div>
            <div class="contact-item"><svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 ..."></path></svg> ${state.personal.address || ''}</div>
            <div class="contact-item">${state.personal.link || ''}</div>
          </div>
        </div>

        <div class="section">
          <h4><span class="accent"></span> KEAHLIAN</h4>
          <div id="skills-render"></div>
        </div>
      </div>

      <div class="col-right">
        <div class="section">
          <h4><span class="accent"></span> PENDIDIKAN</h4>
          <div id="edu-render"></div>
        </div>

        <div class="section">
          <h4><span class="accent"></span> PENGALAMAN</h4>
          <div id="exp-render"></div>
        </div>
      </div>
    </div>
  `;
  cv.appendChild(div);

  // render educations
  const eduRender = document.getElementById('edu-render');
  state.educations.forEach(ed => {
    const item = document.createElement('div');
    item.className = 'edu-item clearfix';
    item.innerHTML = `<div><small>${ed.institution}</small></div>
                      <div class="year">${ed.year||''}</div>`;
    eduRender.appendChild(item);
  });

  // render experiences
  const expRender = document.getElementById('exp-render');
  state.experiences.forEach(ex => {
    const item = document.createElement('div');
    item.className = 'exp-item';
    item.innerHTML = `<div><strong>${ex.role}</strong> — ${ex.company}</div>
                      <div style="color:var(--muted);font-weight:700;margin-top:4px">${ex.period||''}</div>
                      <p style="margin-top:6px">${(ex.description||'').replace(/\n/g,'<br>')}</p>`;
    expRender.appendChild(item);
  });

 // render skills dengan label teks
const skillsRender = document.getElementById('skills-render');
skillsRender.innerHTML = ''; // reset

state.skills.forEach(sk => {
  if(!sk.name) return; // skip jika nama kosong

  const row = document.createElement('div');
  row.className = 'skill-row';
  row.style.display = 'flex';
  row.style.justifyContent = 'space-between';
  row.style.marginBottom = '6px';

  const name = document.createElement('div');
  name.className = 'skill-name';
  name.textContent = sk.name;
  name.style.fontWeight = '600';
  name.style.color = '#1f2937';

  const level = document.createElement('div');
  level.className = 'skill-level';
  level.textContent = sk.level || 'Pemula'; // <-- pastikan level muncul
  level.style.color = 'var(--muted)';
  level.style.fontStyle = 'italic';

  row.appendChild(name);
  row.appendChild(level);
  skillsRender.appendChild(row);
});

  // if no photo, hide the photo-wrap element to match sample look
  const photoImg = document.getElementById('photo-img');
  if(!state.fotoDataUrl) photoImg.style.display='none';
}

/* Download as PDF using html2pdf */
document.getElementById('btn-download').addEventListener('click', () => {
  const el = document.querySelector('#cv-preview .cv');
  if(!el) return alert('Tidak ada preview CV. Klik "Preview CV" terlebih dahulu.');
  // html2pdf options
  const opt = {
    margin: 10,
    filename: `${(state.personal.name || 'CV').replace(/\s+/g,'_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  // clone and adjust width to PDF-friendly
  html2pdf().set(opt).from(el).save();
});

/* Edit button: go back to step 1 */
document.getElementById('btn-edit').addEventListener('click', () => {
  goToStep(1);
});

/* Small UX: click step-5 preview btn also builds preview */
document.querySelectorAll('.step-btn').forEach(b => {
  // noop
});

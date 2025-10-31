document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCadastro');
  const btnCadastrar = document.getElementById('btnCadastrar');
  const btnLimpar = document.getElementById('btnLimpar');
  const mensagemSucesso = document.getElementById('mensagemSucesso');
  const mensagensErro = document.getElementById('mensagensErro');

  const nomeCompleto = document.getElementById('nomeCompleto');
  const email = document.getElementById('email');
  const senha = document.getElementById('senha');
  const confirmacaoSenha = document.getElementById('confirmacaoSenha');
  const dataNascimento = document.getElementById('dataNascimento');
  const telefone = document.getElementById('telefone');
  const pais = document.getElementById('pais');
  const estado = document.getElementById('estado');
  const aceiteTermos = document.getElementById('aceiteTermos');
  const fotoPerfil = document.getElementById('fotoPerfil');
  const fotoPreview = document.getElementById('fotoPreview');
  const forcaSenhaMeter = document.getElementById('forcaSenha');
  const forcaSenhaTexto = document.getElementById('forcaSenhaTexto');

  const erroNome = document.getElementById('erroNome');
  const erroEmail = document.getElementById('erroEmail');
  const erroSenha = document.getElementById('erroSenha');
  const erroConfirmacao = document.getElementById('erroConfirmacaoSenha');
  const erroData = document.getElementById('erroDataNascimento');
  const erroTelefone = document.getElementById('erroTelefone');
  const erroPais = document.getElementById('erroPais');
  const erroEstado = document.getElementById('erroEstado');
  const erroTermos = document.getElementById('erroTermos');
  const erroFoto = document.getElementById('erroFoto');

  const paises = [
    'Selecione um país',
    'Brasil', 'Argentina', 'Estados Unidos', 'Portugal', 'Espanha',
    'França', 'Alemanha', 'Japão', 'China', 'México'
  ];
  const estadosBrasil = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ];

  let emailUnico = false;
  let emailValidoFormato = false;
  let debounceTimer = null;

  function populatePaises() {
    pais.innerHTML = '';
    paises.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx === 0 ? '' : p;
      opt.textContent = idx === 0 ? 'Selecione um país' : p;
      pais.appendChild(opt);
    });
  }
  function populateEstadosBrasil() {
    estado.innerHTML = '';
    estadosBrasil.forEach(uf => {
      const opt = document.createElement('option');
      opt.value = uf;
      opt.textContent = uf;
      estado.appendChild(opt);
    });
  }
  function updateEstadoRequired() {
    if (pais.value === 'Brasil') {
      estado.disabled = false;
      estado.required = true;
      if (!estado.value) populateEstadosBrasil();
    } else {
      estado.disabled = true;
      estado.required = false;
      estado.value = '';
      estado.innerHTML = '';
      erroEstado.textContent = '';
    }
  }
  function validateNome() {
    const v = nomeCompleto.value.trim();
    if (v.length < 3) {
      erroNome.textContent = 'Mínimo de 3 caracteres.';
      return false;
    }
    if (v.length > 255) {
      erroNome.textContent = 'Máximo de 255 caracteres.';
      return false;
    }
    // Letras com acento e espaços
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regex.test(v)) {
      erroNome.textContent = 'Somente letras e espaços, sem números ou especiais.';
      return false;
    }
    erroNome.textContent = '';
    return true;
  }
  function validateEmailFormato() {
    const v = email.value.trim();
    // formato simples de e-mail
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ok = re.test(v);
    emailValidoFormato = ok;
    erroEmail.textContent = ok ? '' : 'E-mail inválido.';
    return ok;
  }
  async function validateEmailUnico() {
    const v = email.value.trim();
    if (!validateEmailFormato()) {
      emailUnico = false;
      // Limpa mensagem geral quando formato é inválido (mensagem específica já é exibida)
      mensagensErro.textContent = '';
      updateSubmitState();
      return;
    }
    try {
      const resp = await fetch(`/api/users/exists?email=${encodeURIComponent(v)}`);
      const data = await resp.json();
      emailUnico = !data.exists;
      erroEmail.textContent = emailUnico ? '' : 'E-mail já cadastrado.';
      mensagensErro.textContent = emailUnico ? '' : 'E-mail já cadastrado.';
    } catch (e) {
      // Em caso de erro, não bloquear, mas informar
      erroEmail.textContent = 'Falha ao verificar unicidade.';
      mensagensErro.textContent = 'Falha ao verificar unicidade.';
      emailUnico = false;
    } finally {
      updateSubmitState();
    }
  }
  function passwordScore(v) {
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  }
  function validateSenha() {
    const v = senha.value;
    const okLen = v.length >= 8;
    const okMai = /[A-Z]/.test(v);
    const okNum = /[0-9]/.test(v);
    const okEsp = /[^A-Za-z0-9]/.test(v);
    const ok = okLen && okMai && okNum && okEsp;
    const pontos = passwordScore(v);
    forcaSenhaMeter.value = pontos;
    const labels = ['—', 'Fraca', 'Fraca', 'Média', 'Forte'];
    forcaSenhaTexto.textContent = `Força da senha: ${labels[pontos]}`;
    erroSenha.textContent = ok ? '' : 'Mín. 8, 1 maiúscula, 1 número, 1 especial.';
    return ok;
  }
  function validateConfirmacao() {
    const ok = senha.value === confirmacaoSenha.value && confirmacaoSenha.value.length > 0;
    erroConfirmacao.textContent = ok ? '' : 'Senhas não coincidem.';
    return ok;
  }
  function parseDateBR(v) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (!m) return null;
    const d = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yyyy = parseInt(m[3], 10);
    const dt = new Date(yyyy, mm - 1, d);
    if (dt.getFullYear() !== yyyy || dt.getMonth() !== mm - 1 || dt.getDate() !== d) {
      return null;
    }
    return dt;
  }
  function validateDataNascimento() {
    const v = dataNascimento.value.trim();
    const dt = parseDateBR(v);
    if (!dt) {
      erroData.textContent = 'Formato inválido: DD/MM/AAAA.';
      return false;
    }
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    if (dt > hoje) {
      erroData.textContent = 'Data não pode ser futura.';
      return false;
    }
    erroData.textContent = '';
    return true;
  }
  function formatTelefoneDigits(str) {
    // Mantém apenas dígitos
    return (str || '').replace(/\D+/g, '');
  }
  function validateTelefone() {
    let v = formatTelefoneDigits(telefone.value);
    telefone.value = v;
    if (!v) {
      erroTelefone.textContent = '';
      return true; // opcional
    }
    if (v.length < 10 || v.length > 11) {
      erroTelefone.textContent = 'Apenas números (10–11 dígitos).';
      return false;
    }
    erroTelefone.textContent = '';
    return true;
  }
  function validatePais() {
    const ok = !!pais.value;
    erroPais.textContent = ok ? '' : 'Selecione um país.';
    return ok;
  }
  function validateEstado() {
    if (pais.value === 'Brasil') {
      const ok = !!estado.value;
      erroEstado.textContent = ok ? '' : 'Selecione um estado.';
      return ok;
    }
    erroEstado.textContent = '';
    return true;
  }
  function validateTermos() {
    const ok = aceiteTermos.checked;
    erroTermos.textContent = ok ? '' : 'É necessário aceitar os termos.';
    return ok;
  }
  function validateFoto() {
    const file = fotoPerfil.files[0];
    if (!file) {
      erroFoto.textContent = '';
      fotoPreview.style.display = 'none';
      fotoPreview.src = '';
      return true;
    }
    const tiposOk = ['image/jpeg', 'image/png'];
    if (!tiposOk.includes(file.type)) {
      erroFoto.textContent = 'Apenas .jpg ou .png.';
      fotoPreview.style.display = 'none';
      fotoPreview.src = '';
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      erroFoto.textContent = 'Arquivo acima de 2MB.';
      fotoPreview.style.display = 'none';
      fotoPreview.src = '';
      return false;
    }
    erroFoto.textContent = '';
    const reader = new FileReader();
    reader.onload = e => {
      fotoPreview.src = e.target.result;
      fotoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    return true;
  }
  function allRequiredValid() {
    const checks = [
      validateNome(),
      validateEmailFormato(),
      emailUnico,
      validateSenha(),
      validateConfirmacao(),
      validateDataNascimento(),
      validatePais(),
      validateEstado(),
      validateTermos(),
      validateFoto(), // foto é opcional, mas mantém regra de tamanho/tipo quando selecionada
      validateTelefone() // opcional, mas regra quando preenchido
    ];
    return checks.every(Boolean);
  }
  function updateSubmitState() {
    btnCadastrar.disabled = false;
  }
  function debounce(fn, delay) {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn(...args), delay);
    };
  }

  // Inicialização
  populatePaises();
  updateEstadoRequired();
  updateSubmitState();

  // Eventos
  nomeCompleto.addEventListener('input', () => { validateNome(); updateSubmitState(); });
  email.addEventListener('input', debounce(() => { validateEmailUnico(); }, 400));
  senha.addEventListener('input', () => { validateSenha(); validateConfirmacao(); updateSubmitState(); });
  confirmacaoSenha.addEventListener('input', () => { validateConfirmacao(); updateSubmitState(); });
  dataNascimento.addEventListener('input', () => { validateDataNascimento(); updateSubmitState(); });
  telefone.addEventListener('input', () => { validateTelefone(); updateSubmitState(); });
  pais.addEventListener('change', () => { validatePais(); updateEstadoRequired(); validateEstado(); updateSubmitState(); });
  estado.addEventListener('change', () => { validateEstado(); updateSubmitState(); });
  aceiteTermos.addEventListener('change', () => { validateTermos(); updateSubmitState(); });
  fotoPerfil.addEventListener('change', () => { validateFoto(); updateSubmitState(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagensErro.textContent = '';
    mensagemSucesso.textContent = '';

    // Força revalidação final
    await validateEmailUnico();
    if (!allRequiredValid()) {
      // Não sobrescreve mensagem específica já definida (ex.: e-mail já cadastrado)
      if (!mensagensErro.textContent) {
        mensagensErro.textContent = 'Verifique os campos destacados e tente novamente.';
      }
      return;
    }

    const genero = document.querySelector('input[name="genero"]:checked');
    const payload = {
      nome: nomeCompleto.value.trim(),
      email: email.value.trim(),
      senha: senha.value, // Em produção, nunca envie senhas em texto sem criptografia
      confirmacaoSenha: confirmacaoSenha.value,
      dataNascimento: dataNascimento.value.trim(),
      genero: genero ? genero.value : null,
      telefone: telefone.value.trim() || null,
      pais: pais.value,
      estado: pais.value === 'Brasil' ? estado.value : null,
      aceiteTermos: aceiteTermos.checked
      // foto: omitido (apenas preview no cliente)
    };

    try {
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.status === 201) {
        mensagemSucesso.textContent = 'Cadastro realizado com sucesso!';
        // Opcional: reset parcial (mantendo email para testar unicidade)
        form.reset();
        fotoPreview.style.display = 'none';
        fotoPreview.src = '';
        emailUnico = false;
        populatePaises();
        updateEstadoRequired();
        updateSubmitState();
      } else {
        const data = await resp.json().catch(() => ({}));
        const msg = data && data.message ? data.message : 'Erro ao cadastrar.';
        mensagensErro.textContent = msg;
        if (resp.status === 409) {
          erroEmail.textContent = 'E-mail já cadastrado.';
        }
      }
    } catch (err) {
      mensagensErro.textContent = 'Falha de comunicação com a API.';
    }
  });

  btnLimpar.addEventListener('click', () => {
    form.reset();
    mensagensErro.textContent = '';
    mensagemSucesso.textContent = '';
    fotoPreview.style.display = 'none';
    fotoPreview.src = '';
    emailUnico = false;
    populatePaises();
    updateEstadoRequired();
    updateSubmitState();
  });
});
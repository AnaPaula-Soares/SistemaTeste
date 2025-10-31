document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formLogin');
  const btnAcessar = document.getElementById('btnAcessar');
  const mensagemSucesso = document.getElementById('mensagemSucesso');
  const mensagemErro = document.getElementById('mensagemErro');
  
  const email = document.getElementById('email');
  const senha = document.getElementById('senha');
  
  const erroEmail = document.getElementById('erroEmail');
  const erroSenha = document.getElementById('erroSenha');
  
  // Função para limpar mensagens
  function limparMensagens() {
    mensagemSucesso.style.display = 'none';
    mensagemErro.style.display = 'none';
    mensagemSucesso.textContent = '';
    mensagemErro.textContent = '';
  }
  
  // Função para mostrar mensagem de sucesso
  function mostrarSucesso(mensagem) {
    limparMensagens();
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.display = 'block';
  }
  
  // Função para mostrar mensagem de erro
  function mostrarErro(mensagem) {
    limparMensagens();
    mensagemErro.textContent = mensagem;
    mensagemErro.style.display = 'block';
  }
  
  // Função para limpar erro de campo específico
  function limparErro(campo, elementoErro) {
    campo.classList.remove('error');
    elementoErro.textContent = '';
  }
  
  // Função para mostrar erro de campo específico
  function mostrarErroCampo(campo, elementoErro, mensagem) {
    campo.classList.add('error');
    elementoErro.textContent = mensagem;
  }
  
  // Validação de email
  function validarEmail(emailValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }
  
  // Validação em tempo real do email
  email.addEventListener('input', () => {
    const emailValue = email.value.trim();
    
    if (emailValue === '') {
      limparErro(email, erroEmail);
    } else if (!validarEmail(emailValue)) {
      mostrarErroCampo(email, erroEmail, 'Por favor, digite um e-mail válido');
    } else {
      limparErro(email, erroEmail);
    }
  });
  
  // Validação em tempo real da senha
  senha.addEventListener('input', () => {
    if (senha.value.trim() !== '') {
      limparErro(senha, erroSenha);
    }
  });
  
  // Limpar mensagens quando o usuário começar a digitar
  email.addEventListener('focus', limparMensagens);
  senha.addEventListener('focus', limparMensagens);
  
  // Função principal de validação
  function validarFormulario() {
    let valido = true;
    
    // Limpar erros anteriores
    limparErro(email, erroEmail);
    limparErro(senha, erroSenha);
    limparMensagens();
    
    const emailValue = email.value.trim();
    const senhaValue = senha.value.trim();
    
    // Validar email
    if (emailValue === '') {
      mostrarErroCampo(email, erroEmail, 'E-mail deve ser informado');
      valido = false;
    } else if (!validarEmail(emailValue)) {
      mostrarErroCampo(email, erroEmail, 'Por favor, digite um e-mail válido');
      valido = false;
    }
    
    // Validar senha
    if (senhaValue === '') {
      mostrarErroCampo(senha, erroSenha, 'Senha deve ser informada');
      valido = false;
    }
    
    return valido;
  }
  
  // Função para realizar login
  async function realizarLogin(emailValue, senhaValue) {
    try {
      btnAcessar.disabled = true;
      btnAcessar.textContent = 'Acessando...';
      
      // Simular uma pequena delay para melhor UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, qualquer email válido e senha acessa
      // Aqui você pode implementar validação real no futuro
      if (validarEmail(emailValue) && senhaValue.length > 0) {
        mostrarSucesso('Login realizado com sucesso! Redirecionando...');
        
        // Redirecionar para o formulário de cadastro após 2 segundos
        setTimeout(() => {
          window.location.href = '/cadastro';
        }, 2000);
        
        return true;
      } else {
        mostrarErro('Credenciais inválidas. Tente novamente.');
        return false;
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      mostrarErro('Erro interno. Tente novamente mais tarde.');
      return false;
    } finally {
      btnAcessar.disabled = false;
      btnAcessar.textContent = 'Acessar';
    }
  }
  
  // Event listener do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      const emailValue = email.value.trim();
      const senhaValue = senha.value.trim();
      
      await realizarLogin(emailValue, senhaValue);
    }
  });
  
  // Permitir submit com Enter
  [email, senha].forEach(campo => {
    campo.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
      }
    });
  });
  
  // Focar no primeiro campo ao carregar a página
  email.focus();
});
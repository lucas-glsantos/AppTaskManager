// ErrorModal.jsx
import { useState } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// Animações Globais e Chaves
export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
  body {
    font-family: "Varela Round", sans-serif;
    margin: 0;
  }
`;

const jump = keyframes`
  0% { margin-bottom: -3vmin; }
  100% { margin-bottom: 0; }
`;

// Componentes Estilizados
const ModalLink = styled.div`
  position: relative;
  display: inline-block;
`;

const ModalButton = styled.button`
  position: relative;
  margin: 0.15em;
  padding: 0.25em 0.65em;
  border-radius: 10px;
  background: ${(props) => props.theme.dm1}; // Recebe a cor dinamicamente!
  color: #fffe;
  font-size: 2em;
  border: none;
  border-bottom: 5px solid ${(props) => props.theme.dm2};
  box-shadow: 0px 6px 6px -3px ${(props) => props.theme.dm1};
  text-shadow: 0 -1px 1px ${(props) => props.theme.dm3}, 0 1px 1px ${(props) => props.theme.dm2};
  cursor: pointer;
  transition: all 0.2s ease 0s;

  &:hover {
    background: ${(props) => props.theme.dm2};
    transform: translateY(4px);
    border-bottom: 1px solid ${(props) => props.theme.dm3};
    box-shadow: 0px 0px 2px ${(props) => props.theme.dm3}, 0px 0px 35px 0px ${(props) => props.theme.dm1};
  }
`;

// O modal é controlado pela prop $isOpen
const ModalWindow = styled.div`
  background: #F3F3F3;
  position: fixed;
  z-index: 333;
  padding: 1.75em 2em 2em 1.75em;
  border-radius: 2px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 51vmin;
  
  /* Lógica de aparecer/desaparecer baseada no estado do React */
  margin-top: ${(props) => (props.$isOpen ? '0' : '150vh')};
  transition: all 1s ease 0s;

  h2 {
    color: ${(props) => props.theme.dm1};
    text-align: center;
    font-size: 4.25vmin;
    animation: ${(props) => (props.$isOpen ? jump : 'none')} 1s forwards 0.85s;
  }
  
  .demon * {
    animation: ${(props) => (props.$isOpen ? jump : 'none')} 1s forwards 0.75s;
  }
  .demon .hole { animation: none; }

  /* Aqui você colaria todo o resto do CSS complexo dos demônios */
  /* O styled-components suporta pseudo-elementos normalmente */
  .demon {
    width: 100%;
    height: 32vmin;
    position: relative;
    overflow: hidden;
    /* ... resto do CSS do demônio ... */
  }
`;

const Overlay = styled.div`
  background: linear-gradient(180deg, ${(props) => props.theme.dm1}, ${(props) => props.theme.dm2}, ${(props) => props.theme.dm3}, #fff0);
  position: fixed;
  left: 0; top: 0;
  width: 100%; height: 150vh;
  z-index: 1;
  margin-top: ${(props) => (props.$isOpen ? '0' : '-200vh')};
  opacity: 0.8;
  transition: all 1s ease 0s;
`;


const ErrorModal = ({ code, title, text1, text2, theme, renderDemonExtras }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalLink>
      {/* O botão usa a prop 'theme' para se auto-colorir */}
      <ModalButton theme={theme} onClick={() => setIsOpen(true)}>
        {code}
      </ModalButton>
      
      <ModalWindow $isOpen={isOpen} theme={theme}>
        <h1>{code}</h1>
        <h2>{title}</h2>
        <p>{text1}</p>
        <p>{text2}</p>
        
        <div className="demon">
          <div className="hole" style={{ background: 'linear-gradient(180deg, #cdd0d9, #b7b7b7)' }}></div>
          {renderDemonExtras()}
          <div className="body" style={{ background: theme.dm1 }}></div>
          {/* Outras partes do demônio */}
        </div>
      </ModalWindow>
      
      <Overlay $isOpen={isOpen} theme={theme} onClick={() => setIsOpen(false)} />
    </ModalLink>
  );
};

export default ErrorModal;
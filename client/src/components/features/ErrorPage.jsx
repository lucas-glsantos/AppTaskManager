import ErrorModal from '@/components/features/ErrorModal';



// Array com os dados de cada erro para alimentar os modais
const errorsData = [
  {
    code: 400,
    title: "Bad Request",
    text1: "A solicitação está malformada.",
    text2: "A solicitação HTTP do cliente não está em conformidade com os padrões do protocolo HTTP. Por favor, verifique-a.",
    theme: { dm1: '#f08a46', dm2: '#b87b34', dm3: '#633a1e' },
    renderDemonExtras: () => <div className=""></div>
  },
  {
    code: 404,
    title: "Not Found",
    text1: "Desculpe, nada foi encontrado.",
    text2: "O recurso solicitado foi excluído ou movido para um local diferente.",
    theme: { dm1: '#4682f0', dm2: '#3457b8', dm3: '#1e2b63' },
    renderDemonExtras: () => <div className=""></div>
  }
];

const ErrorPage = () => {
  return (
    <>
        <div className='content'>
            <div className='modal-links'>
                {/* Faz o loop criando um ErrorModal para cada item do array */}
                {errorsData.map((error) => (
                  <ErrorModal 
                    key={error.code} 
                    {...error} 
                  />
                ))}
            </div>
        </div>
    </>
  );
};

export default ErrorPage;
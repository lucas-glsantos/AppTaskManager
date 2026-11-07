const Footer = () => {
    // Pega o ano atual para manter o copyright sempre em dia
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-base-300 border-t border-base-content/10 mt-auto">
            <div className="mx-auto max-w-6xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="text-base-content/70 text-sm font-medium">
                        <p>
                            Developed by <span className="text-primary">Lucas Santos </span>
                            | ©{currentYear} Todos os direitos reservados.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <a
                            href="https://www.linkedin.com/in/lucasglsantos/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-content/70 hover:text-primary"
                            title="LinkedIn"
                        >
                            <div className="size-5" />
                            <span>LinkedIn</span>
                        </a>
                        <a
                            href="https://github.com/lucas-glsantos/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-content/70 hover:text-primary"
                            title="GitHub"
                        >
                            <div className="size-5" />
                            <span>GitHub</span>
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
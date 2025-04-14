  return (
    <div style={pageStyle}>
      {/* Header */}
      {renderHeader()}
      
      {/* Banner com título da página */}
      <section className="relative py-16 bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/about-bg.jpg"
            alt="Sobre nós"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--fonte-titulos)' }}
            >
              Sobre Nós
            </h1>
            <p className="text-lg text-gray-200">
              Conheça nossa história, valores e a equipe por trás da {imobiliariaInfo.nome}
            </p>
          </div>
        </div>
      </section>
      
      {/* Seção Principal */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge
                className="mb-4 text-xs"
                style={{ 
                  backgroundColor: 'var(--cor-secundaria)',
                  color: 'var(--cor-primaria)'
                }}
              >
                NOSSA HISTÓRIA
              </Badge>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)' 
                }}
              >
                {imobiliariaInfo.nome}: Tradição e inovação no mercado imobiliário
              </h2>
              
              <div className="prose max-w-none text-gray-600 mb-8">
                <p>{imobiliariaInfo.historia || imobiliariaInfo.descricao}</p>
              </div>
              
              {/* Fundação e CRECI */}
              <div className="flex flex-col sm:flex-row gap-6">
                {imobiliariaInfo.anoFundacao && (
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Building2 
                        className="h-5 w-5"
                        style={{ color: 'var(--cor-primaria)' }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        Ano de Fundação
                      </h3>
                      <p className="text-gray-600">{imobiliariaInfo.anoFundacao}</p>
                    </div>
                  </div>
                )}
                
                {imobiliariaInfo.creci && (
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4"
                      style={{ backgroundColor: 'var(--cor-secundaria)' }}
                    >
                      <Award 
                        className="h-5 w-5"
                        style={{ color: 'var(--cor-primaria)' }}
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        CRECI
                      </h3>
                      <p className="text-gray-600">{imobiliariaInfo.creci}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-xl h-96">
                <Image
                  src="/images/about-image.jpg"
                  alt={imobiliariaInfo.nome}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div 
                className="absolute -bottom-6 -right-6 w-40 h-40 rounded-lg shadow-lg overflow-hidden hidden lg:block"
                style={{ 
                  backgroundColor: 'var(--cor-primaria)' 
                }}
              >
                <div className="p-6 text-white flex flex-col items-center justify-center h-full">
                  <span className="text-3xl font-bold block mb-1">
                    {imobiliariaInfo.anoFundacao 
                      ? new Date().getFullYear() - imobiliariaInfo.anoFundacao 
                      : 10}+
                  </span>
                  <span className="text-sm uppercase tracking-wider">
                    Anos de experiência
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Missão, Visão e Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Missão */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <Target 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossa Missão
              </h3>
              
              <p className="text-gray-600">
                {imobiliariaInfo.missao || "Facilitar a realização do sonho da casa própria, oferecendo um atendimento personalizado e soluções imobiliárias que atendam às necessidades dos nossos clientes."}
              </p>
            </div>
            
            {/* Visão */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <Star 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossa Visão
              </h3>
              
              <p className="text-gray-600">
                {imobiliariaInfo.visao || "Ser reconhecida como referência no mercado imobiliário, pela excelência no atendimento, transparência nas negociações e compromisso com a satisfação dos clientes."}
              </p>
            </div>
            
            {/* Valores */}
            <div 
              className="bg-white p-8 rounded-xl shadow-md"
              style={{ borderTop: `4px solid ${corPrimaria}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-secundaria)' }}
              >
                <BookOpen 
                  className="h-6 w-6"
                  style={{ color: 'var(--cor-primaria)' }}
                />
              </div>
              
              <h3 
                className="text-xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Nossos Valores
              </h3>
              
              <ul className="space-y-3">
                {(imobiliariaInfo.valores || [
                  "Ética e transparência",
                  "Compromisso com o cliente",
                  "Excelência no atendimento",
                  "Respeito às pessoas"
                ]).map((valor, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 
                      className="h-5 w-5 mr-2 flex-shrink-0"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-gray-600">{valor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

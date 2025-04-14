          {/* Equipe */}
          {equipe.length > 0 && (
            <div className="mb-20">
              <div className="text-center mb-12">
                <Badge
                  className="mb-4 text-xs"
                  style={{ 
                    backgroundColor: 'var(--cor-secundaria)',
                    color: 'var(--cor-primaria)'
                  }}
                >
                  NOSSA EQUIPE
                </Badge>
                <h2 
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)' 
                  }}
                >
                  Conheça os profissionais por trás da {imobiliariaInfo.nome}
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Nossa equipe é formada por profissionais capacitados e comprometidos em oferecer o melhor atendimento e as melhores soluções para nossos clientes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equipe.map((membro) => (
                  <Card key={membro.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-64">
                      <Image
                        src={membro.foto || '/images/avatar-placeholder.jpg'}
                        alt={membro.nome}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 
                        className="text-lg font-semibold mb-1"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          fontFamily: 'var(--fonte-titulos)'
                        }}
                      >
                        {membro.nome}
                      </h3>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: 'var(--cor-primaria)' }}
                      >
                        {membro.cargo}
                      </p>
                      
                      {membro.descricao && (
                        <p className="text-sm text-gray-600 mb-4">{membro.descricao}</p>
                      )}
                      
                      {/* Redes sociais */}
                      <div className="flex space-x-2">
                        <a 
                          href={`mailto:${membro.contato?.email || ''}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={{ 
                            backgroundColor: 'var(--cor-secundaria)', 
                            color: 'var(--cor-primaria)' 
                          }}
                          aria-label="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        
                        {membro.contato?.linkedin && (
                          <a 
                            href={membro.contato.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                            style={{ 
                              backgroundColor: 'var(--cor-secundaria)', 
                              color: 'var(--cor-primaria)' 
                            }}
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Diferenciais */}
          <div>
            <div className="text-center mb-12">
              <Badge
                className="mb-4 text-xs"
                style={{ 
                  backgroundColor: 'var(--cor-secundaria)',
                  color: 'var(--cor-primaria)'
                }}
              >
                POR QUE NOS ESCOLHER
              </Badge>
              <h2 
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)' 
                }}
              >
                Nossos diferenciais
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Combinamos experiência, tecnologia e atendimento personalizado para oferecer a melhor experiência aos nossos clientes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Diferencial 1 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <Award 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Credibilidade
                </h3>
                
                <p className="text-gray-600">
                  Somos uma empresa registrada e regularizada, com CRECI ativo e profissionais capacitados para garantir a segurança jurídica nas transações.
                </p>
              </div>
              
              {/* Diferencial 2 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <Users 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Atendimento personalizado
                </h3>
                
                <p className="text-gray-600">
                  Entendemos que cada cliente tem necessidades específicas. Por isso, oferecemos um atendimento personalizado para encontrar o imóvel ideal para você.
                </p>
              </div>
              
              {/* Diferencial 3 */}
              <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--cor-secundaria)' }}
                >
                  <TrendingUp 
                    className="h-6 w-6"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                </div>
                
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Tecnologia avançada
                </h3>
                
                <p className="text-gray-600">
                  Utilizamos tecnologia de ponta para facilitar a busca por imóveis, com fotos de alta qualidade, tour virtual e informações detalhadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section 
        className="py-16"
        style={{ backgroundColor: 'var(--cor-primaria)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-6 text-white"
            style={{ fontFamily: 'var(--fonte-titulos)' }}
          >
            Pronto para encontrar o imóvel dos seus sonhos?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Entre em contato conosco e descubra como podemos ajudar você a encontrar o imóvel ideal para suas necessidades.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white hover:bg-white/90 text-primary"
              style={{ 
                '--primary': 'var(--cor-primaria)',
                fontFamily: 'var(--fonte-titulos)'
              } as React.CSSProperties}
            >
              Ver imóveis
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-white border-white hover:bg-white/10"
            >
              Fale conosco
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      {renderFooter()}
      
      {/* Badge conteúdo gerado por IA */}
      <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-full py-1 px-3 text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <Image src="/images/ai-badge.svg" alt="AI" width={16} height={16} />
        <span>Conteúdo gerado por I.A.</span>
      </div>
    </div>
  );
}

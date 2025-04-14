                <TabsContent value="descricao" className="pt-4">
                  <div className="space-y-6">
                    <h3 
                      className="text-xl font-semibold mb-4"
                      style={{ 
                        color: 'var(--cor-texto)', 
                        fontFamily: 'var(--fonte-titulos)'
                      }}
                    >
                      Sobre este imóvel
                    </h3>
                    
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: imovel.descricao }}
                    />
                    
                    {/* Detalhes adicionais */}
                    {imovel.adicionais && imovel.adicionais.length > 0 && (
                      <div className="pt-6">
                        <h4 
                          className="text-lg font-semibold mb-4"
                          style={{ 
                            color: 'var(--cor-texto)', 
                            fontFamily: 'var(--fonte-titulos)'
                          }}
                        >
                          Características
                        </h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {imovel.adicionais.map(adicional => (
                            <div key={adicional.id} className="flex items-start">
                              <CheckCircle2 
                                className="h-5 w-5 mr-2 flex-shrink-0"
                                style={{ color: 'var(--cor-primaria)' }}
                              />
                              <span className="text-gray-700">{adicional.nome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="localizacao" className="pt-4">
                  <div className="space-y-6">
                    <h3 
                      className="text-xl font-semibold mb-4"
                      style={{ 
                        color: 'var(--cor-texto)', 
                        fontFamily: 'var(--fonte-titulos)'
                      }}
                    >
                      Localização
                    </h3>
                    
                    <div className="flex items-center mb-4">
                      <Map className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">{fullAddress}</span>
                    </div>
                    
                    {/* Componente de mapa */}
                    <div className="h-[400px] rounded-lg overflow-hidden">
                      {imovel.latitude && imovel.longitude ? (
                        <MapComponent 
                          latitude={imovel.latitude} 
                          longitude={imovel.longitude} 
                          address={fullAddress}
                        />
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center">
                          <div className="text-center p-6">
                            <Globe className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">
                              Localização aproximada. Coordenadas exatas não disponíveis.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="avaliacoes" className="pt-4">
                  <PropertyReviews 
                    imovelId={imovel.id}
                    imobiliariaId={imovel.imobiliariaId || ''}
                    avaliacoes={avaliacoes}
                    corPrimaria={corPrimaria}
                    corSecundaria={corSecundaria}
                    corTexto={corTexto}
                    fonteTitulos={fonteTitulos}
                    fonteCorpo={fonteCorpo}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar - Contato e informações */}
            <div className="w-full lg:w-1/3">
              {/* Formulário de contato */}
              <ContactForm 
                imovelId={imovel.id}
                imovelTitulo={imovel.titulo}
                imovelCodigo={imovel.codigo}
                imobiliariaId={imovel.imobiliariaId || ''}
                corPrimaria={corPrimaria}
                corSecundaria={corSecundaria}
                corTexto={corTexto}
                fonteTitulos={fonteTitulos}
                fonteCorpo={fonteCorpo}
                className="mb-6"
              />
              
              {/* Infos extras e badge IA */}
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <div className="flex items-start mb-4">
                  <Info 
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--cor-primaria)' }}
                  />
                  <div>
                    <h4 
                      className="font-medium mb-1"
                      style={{ 
                        color: 'var(--cor-texto)', 
                        fontFamily: 'var(--fonte-titulos)'
                      }}
                    >
                      Conteúdo gerado por I.A.
                    </h4>
                    <p className="text-sm text-gray-600">
                      Algumas descrições e características deste imóvel podem ter sido 
                      complementadas por inteligência artificial.
                    </p>
                  </div>
                </div>
                
                {imovel.creci && (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      CRECI: {imobiliariaInfo.creci}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Ações rápidas */}
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h4 
                  className="text-lg font-semibold mb-4"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Ações rápidas
                </h4>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start gap-2"
                    style={{ 
                      backgroundColor: 'var(--cor-primaria)',
                      color: 'white'
                    }}
                  >
                    <Phone className="h-4 w-4" />
                    Ligar agora
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    style={{ 
                      borderColor: 'var(--cor-primaria)',
                      color: 'var(--cor-primaria)'
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Imóveis relacionados */}
      {imoveisRelacionados.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 
              className="text-2xl font-bold mb-8"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              Imóveis semelhantes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveisRelacionados.map(imovelRelacionado => (
                <Link 
                  href={`/imoveis/${imovelRelacionado.id}`} 
                  key={imovelRelacionado.id}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:-translate-y-1">
                    <div className="relative h-48">
                      <Image
                        src={imovelRelacionado.fotoPrincipal || '/images/property-placeholder.jpg'}
                        alt={imovelRelacionado.titulo}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge 
                          className="uppercase text-xs font-medium"
                          style={{ 
                            backgroundColor: 'var(--cor-primaria)',
                            color: 'white'
                          }}
                        >
                          {imovelRelacionado.tipoOperacao === 'venda' ? 'Venda' : 'Aluguel'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 
                        className="text-lg font-semibold mb-1 truncate group-hover:text-primary transition-colors"
                        style={{ 
                          color: 'var(--cor-texto)', 
                          '--primary': 'var(--cor-primaria)',
                          fontFamily: 'var(--fonte-titulos)'
                        } as React.CSSProperties}
                      >
                        {imovelRelacionado.titulo}
                      </h3>
                      
                      <div className="text-gray-500 text-sm mb-3 truncate">
                        {imovelRelacionado.bairro}, {imovelRelacionado.cidade} - {imovelRelacionado.estado}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div 
                          className="font-bold"
                          style={{ color: 'var(--cor-primaria)' }}
                        >
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0
                          }).format(imovelRelacionado.valor)}
                        </div>
                        
                        <div className="flex text-gray-500 text-sm">
                          {imovelRelacionado.quartos !== undefined && (
                            <div className="flex items-center mr-3">
                              <BedDouble className="h-4 w-4 mr-1" />
                              <span>{imovelRelacionado.quartos}</span>
                            </div>
                          )}
                          
                          {imovelRelacionado.banheiros !== undefined && (
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span>{imovelRelacionado.banheiros}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      {renderFooter()}
      
      {/* Badge conteúdo gerado por IA */}
      <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-full py-1 px-3 text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <Image src="/images/ai-badge.svg" alt="AI" width={16} height={16} />
        <span>Conteúdo gerado por I.A.</span>
      </div>
      
      {/* Modal de todas as fotos */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Fotos de {imovel.titulo}
              </h3>
              
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowAllPhotos(false)}
              >
                Fechar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="relative aspect-[4/3] cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setShowAllPhotos(false);
                  }}
                >
                  <Image
                    src={photo}
                    alt={`Foto ${index + 1} de ${imovel.titulo}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para ser importado dinamicamente
export const MapComponent = ({ latitude, longitude, address }: { 
  latitude: number, 
  longitude: number,
  address: string
}) => {
  return (
    <div className="h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center p-6">
        <Map className="h-8 w-8 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">
          Mapa será renderizado com as coordenadas: {latitude}, {longitude}
        </p>
        <p className="text-gray-500 mt-2">
          {address}
        </p>
      </div>
    </div>
  );
};

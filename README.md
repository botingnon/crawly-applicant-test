# Crawly Aplicação teste   

Aplicação simples para recuperar resposta na página informada.


## Configuração projeto
```
npm install
```  

## Iniciando o projeto (sem proxy)
```
npm start
```  

## Iniciando o projeto com proxy (Tor Client)
```
npm run proxy
```  

### Instruções de instalação Tor Client   

- Siga as instruções de instalação: https://www.npmjs.com/package/tor-request#requirements   
- Habilite o ControlPort com a senha: 'my_secret_password'   
- Crie o arquivo torrc (No local indicado no link acima) com os dados:   
ControlPort 9051
HashedControlPassword 16:C508A083CB0F8BE4606EBD5B5D7105E1D54FDB1994707632F4F3F457CA   



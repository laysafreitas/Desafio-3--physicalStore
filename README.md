# Desafio 3 - PsycalStore

# Objetivos

- Esse desafio é uma continuação e implementação de um Desafio feito anteriormente pela
  empresa compass, onde a API encontraria lojas fisicas com um CEP determinado;
- A API utilizá multiplos serviços de geolocalização para calcular com precisão a distancia
  e rotas entre o endereço do usuario e as lojas cadastradas;
- Nessa versão, apartir de um cep,de preferencia do cliente, ele calculará e retornará
uma loja proxima em um raio de 50km, com frete calculado e os dias para ser entregue;

# 🛠️ Instalações

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# 2. Acesse a pasta do projeto
cd seu-repositorio

# 3. Instale as dependências
npm install

# Para rodar o projeto em ambiente de desenvolvimento:

npm start

# Para rodar os testes:

npm run test
```
# ⚙️ Modelo .env

```env
DATABASE_URI=mongodb://localhost:27017/seu-banco
TOKEN= token gerado pelo melhor envio
```
# 🧰 Tecnologias Usadas

Node.js – Ambiente de execução JavaScript

NestJS – Framework para aplicações Node escaláveis

TypeScript – Superset do JavaScript com tipagem estática

MongoDB – Banco de dados NoSQL orientado a documentos

Mongoose – ODM para MongoDB

Winston – Logger flexível para Node.js

dotenv – Gerenciamento de variáveis de ambiente

Jest – Framework de testes com cobertura integrada

# 🤝 Contribuição

```bash
# Crie uma nova branch:
git checkout -b minha-feature

# Faça suas alterações e dê commit:
git commit -m 'feat: minha nova feature'

# Envie sua branch para o repositório remoto:
git push origin minha-feature

# Abra um Pull Request
 ```

# 📝 Licença"

Este projeto está licenciado sob a licença MIT.

Você é livre para usar, modificar e distribuir este projeto, desde que preserve os créditos aos autores originais.

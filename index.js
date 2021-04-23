import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";

const secretKey = "d32gtr3gs872gddiud"
const app = express()
const port = 3000

app.use(express.json());


function validaToken(req, res, next) {
  console.log(req.headers)
  let token = req.headers.authorization;
  token = token.replace("Bearer ", "");
  console.log(token);
  if (!token){
    return res.status(401).end();
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).end();
    }
    req.userId = decoded.id;
    next();
  });
}

app.post("/conta", validaToken, (req, res) =>{
  let rawdata = fs.readFileSync('accounts.json');
  let arquivo = JSON.parse(rawdata);

  var novaConta = {
    id: arquivo.length,
    account: req.body.account,
    balance: req.body.balance
  }

  arquivo.push(novaConta);

  var novoJson = JSON.stringify(arquivo);

  fs.writeFileSync('accounts.json', novoJson, 'utf8', () => {
    res.status(201).send(novaConta);
  });

});

app.put("/conta/depositar", validaToken, (req, res) =>{
  let rawdata = fs.readFileSync('accounts.json');
  let arquivo = JSON.parse(rawdata);

  //Validar se a conta existe

  arquivo.forEach(conta => {
    if (conta.id === req.body.id){

      conta.balance += req.body.valor;
      var novoJson = JSON.stringify(arquivo);

      fs.writeFile('accounts.json', novoJson, 'utf8', () => {
        res.status(200).send("Depósito realizado");
      });
    }
  });

  //res.status(500).send("Conta inexistente");
});

app.put("/conta/sacar", validaToken, (req, res) =>{
  let rawdata = fs.readFileSync('accounts.json');
  let arquivo = JSON.parse(rawdata);

  //Validar se a conta existe
  arquivo.forEach(conta => {
    if (conta.id === req.body.id){

      //Validar se saldo é suficiente
      if (conta.balance >= req.body.valor){
        conta.balance -=  req.body.valor;
        var novoJson = JSON.stringify(arquivo);
        fs.writeFile('accounts.json', novoJson, 'utf8', () => {
          res.status(200).send("Saldo atualizado");
        });
      }else{
        res.status(500).send("Saldo insuficiente");
      }
     
    }
  });

  //res.status(500).send("Conta inexistente");
});

app.get("/conta", validaToken, (req, res) =>{
  let rawdata = fs.readFileSync('accounts.json');
  let arquivo = JSON.parse(rawdata);

  arquivo.forEach(conta => {
    if (conta.id === req.body.id){
      res.status(200).send("Balance: " + conta.balance);
    }
  });

  //res.status(500).send("Conta inexistente");
});

app.delete("/conta", validaToken, (req, res) =>{
  let rawdata = fs.readFileSync('accounts.json');
  let arquivo = JSON.parse(rawdata);

  //Validar se a conta existe
  arquivo.forEach(conta => {
    if (conta.id === req.body.id){
        const index = arquivo.indexOf(conta);
        if (index > -1) {
          arquivo.splice(index, 1);
        }
        var novoJson = JSON.stringify(arquivo);
        fs.writeFile('accounts.json', novoJson, 'utf8', () => {res.status(200).send("Conta removida");});
      }
    });

    //res.status(500).send("Conta inexistente");
});

app.get('/login', (request, response) => {
  if (request.body.user == "joao" && request.body.password == "1234"){
    const id = 1;
    const token = jwt.sign({ id }, secretKey, {
      expiresIn: 60000
    });
    response.send({ token });
  } else {
    response.sendStatus(401);
  }
})

app.listen(port, () => {
  //Callback quando subir
  console.log(`Servidor de pé em http://localhost:${port}`)
})


var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/product";
var io = require('../server');
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var coinbase = web3.eth.coinbase;
console.log(coinbase);
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

//Authentication Packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


router.get('/', function (req, res) {
   res.render( 'login');
})
router.get('/verify', authenticationMiddleware(), function (req, res) {
   res.render( 'verify');
})
router.get('/dashboard',authenticationMiddleware(), function (req, res) {
    var result=[];
  MongoClient.connect(url, function(err, db) {
    db.collection('article').find({}).count(function(err, count) {
    result.push({"article":count});
    });
    db.collection('register').find({}).count(function(err, count) {
    result.push({"register":count});
    });
    db.collection('sessions').find({}).count(function(err, count) {
    result.push({"sessions":count});
    //console.log(result);
    res.render('dashboard', {result: result});
    });
            });
})

router.get('/writer',authenticationMiddleware(), function (req, res) {
   res.render( 'writer');
})
router.get('/reviewer',authenticationMiddleware(), function (req, res) {
   res.render( 'reviewer');
})

router.post('/verify', authenticationMiddleware(), function (req, res1) {
  req.checkBody('contractAddress', 'contractAddress field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('verify', {errors:"Please check all fields"});
  }else{

    var isAddress = function (address) {
    // function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
}
var isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    var addressHash = web3.sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
}

    if(!isAddress(req.body.contractAddress)){
      res1.render('verify', {errors:"This is not valid Product contract Address"});
    }else{
      var address = req.body.contractAddress;
          abiProductContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"Title","type":"string"},{"name":"LicNo","type":"string"},{"name":"Price","type":"string"},{"name":"Type","type":"string"},{"name":"Company","type":"string"},{"name":"Status1","type":"string"},{"name":"Comment","type":"string"}],"name":"addNewProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getProduct","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"Status1","type":"string"}],"name":"updateProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      var Acc = abiProductContract.at(address);
      Acc.GetCount.call(function (error, Count){
      Acc.getProduct.call(Count-1,function(err, res){
        if(res){
          var array=[{"title":res[0]},{"license":res[1]},{"price":res[2]},{"type":res[3]},{"company":res[4]},{"status":res[5]}, {"comment":res[5]} ]
          res1.render('verify', {products: array, ok:"This Product is Found in Blockchain -Original "});
        }else{
          res1.render('verify', {products: array, errors:"This Product is Not Found in Blockchain"});
        }
      });
    })
    }

}
});
router.get('/reader',authenticationMiddleware(), function (req, res) {
  var result = [];
MongoClient.connect(url, function(err, db) {
var cursor = db.collection('product').find({});
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
    db.close();
        res.render('reader', {products: result});
  });
          });
});
router.post('/product/search',authenticationMiddleware(), function(req,res){
  var result = [];
MongoClient.connect(url, function(err, db) {
  var qselect = req.body.search_categories;
  switch(qselect){
    case 'title':
    var query = { 'title': req.body.searchValue };
    break;
    case 'company':
    var query = { 'company': req.body.searchValue };
    break;
    case 'price':
    var query = { 'price': req.body.searchValue };
    break;
    case 'type':
    var query = { 'type': req.body.searchValue };
    break;
    case '':
    var query = {};
    break;
  }
var cursor = db.collection('product').find(query);
  cursor.forEach(function(doc, err) {
    result.push(doc);
  }, function() {
    db.close();
        res.render('reader', {products: result});4
  });
          });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      MongoClient.connect(url, function(err, db){
    var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
    var result = [];
    var query = {'email':username};
    var display={'contractAddress':1}
    var cursor = db.collection('register').find(query,display);
      cursor.forEach(function(doc, err) {
        result.push(doc);
      }, function() {
if(result[0]==undefined){
  return done(null,false, {message:'!!! New to TruthChain? Please SignUp !!!'})
}else{
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var one = new String(password);
  var two = new String(res[2]);
  if( one.valueOf() === two.valueOf()){
        const user_id=result[0]._id;
        return done(null,user_id, {message: ' Successfully Authenticated'})
      }else {
      return done(null,false, {message:'!!! User Credentials are wrong !!!'})
       }
    });
  });
}
 });
});
}
));

router.post('/login',passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/', badRequestMessage : 'Missing username or password.',
    failureFlash: true}), function (req, res1) {
})

router.post('/reviewer',authenticationMiddleware(), function (req, res1) {
  req.checkBody('contractAddress', 'contractAddress field cannot be empty').notEmpty();
  req.checkBody('status', 'status field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('reviewer', {errors:"Please check all fields"});
  }else{
  var contractAddress = req.body.contractAddress;
  var status = req.body.status;
  MongoClient.connect(url, function(err, db){
  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      var result = [];
      var  user=req.user;
      var query = new mongo.ObjectID(req.user);
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var entity = new String('reviewer');
  if(  new String(res[3]).valueOf() === entity.valueOf()){
    abiProductContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"Title","type":"string"},{"name":"LicNo","type":"string"},{"name":"Price","type":"string"},{"name":"Type","type":"string"},{"name":"Company","type":"string"},{"name":"Status1","type":"string"},{"name":"Comment","type":"string"}],"name":"addNewProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getProduct","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"Status1","type":"string"}],"name":"updateProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

    var articleContract = abiProductContract.at(contractAddress);
  articleContract.GetCount.call(function (error, Count){
  articleContract.updateProduct(Count-1, status, {from:coinbase, gas: 4712388,
  gasPrice: 100000000000}, function(error){
  if(error){
     res1.render('reviewer', {errors:'Error While updating Product'});
  }else {
    MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var myquery = { "contractAddress": contractAddress };
              var newvalues =  {$set:{ "status":status} };
              db.collection("product").update(myquery, newvalues );
      });
      io.sockets.on('connection',function(socket){
      io.sockets.emit('update', {address:contractAddress,status:status});
      });
    res1.render('reviewer', {ok:'Successfully Reviewed Product'});
    }
  })
});
}else{
    res1.render('reviewer', {errors:'You dont have privilage to update Product'});
        }
    });
  });
});
});
}
});

router.post('/product',authenticationMiddleware(), function (req, res1) {
  req.checkBody('title', 'title field cannot be empty').notEmpty();
  req.checkBody('status', 'status field cannot be empty').notEmpty();
  req.checkBody('company', 'company field cannot be empty').notEmpty();
  req.checkBody('type', 'type field cannot be empty').notEmpty();
  req.checkBody('price', 'price field cannot be empty').notEmpty();
  req.checkBody('license', 'license field cannot be empty').notEmpty();
  req.checkBody('comment', 'comment field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res1.render('writer', {errors:"Please check all fields"});
  }else{
  MongoClient.connect(url, function(err, db){
  var title = req.body.title;
  var company = req.body.company;
  var status = req.body.status;
  var type = req.body.type;
  var comment = req.body.comment;
  var price = req.body.price;
  var license = req.body.license;
  var comment = req.body.comment;
  var AccContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      var result = [];
      var  user=req.user;
      var query = new mongo.ObjectID(req.user);
      var display={'contractAddress':1,_id:0}
      var cursor = db.collection('register').find(query,display);
        cursor.forEach(function(doc, err) {
          result.push(doc);
        }, function() {
          db.close();
  var Acc = AccContract.at(result[0].contractAddress);
  Acc.GetCount.call(function (error, Count){
  Acc.getAccount.call(Count-1,function(err, res){
  var writer = new String('writer');
  if(  new String(res[3]).valueOf() === writer.valueOf()){
    abiProductContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"Title","type":"string"},{"name":"LicNo","type":"string"},{"name":"Price","type":"string"},{"name":"Type","type":"string"},{"name":"Company","type":"string"},{"name":"Status1","type":"string"},{"name":"Comment","type":"string"}],"name":"addNewProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getProduct","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"},{"name":"Status1","type":"string"}],"name":"updateProduct","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]);

articleCode=("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b610f478061003a6000396000f300606060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630ab939711461006757806323192aac14610096578063503220e314610285578063f1634e05146105ac575b600080fd5b341561007257600080fd5b61007a610615565b604051808260ff1660ff16815260200191505060405180910390f35b34156100a157600080fd5b610283600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061062c565b005b341561029057600080fd5b6102a9600480803560ff169060200190919050506107cc565b604051808060200180602001806020018060200180602001806020018060200188810388528f818151815260200191508051906020019080838360005b838110156103015780820151818401526020810190506102e6565b50505050905090810190601f16801561032e5780820380516001836020036101000a031916815260200191505b5088810387528e818151815260200191508051906020019080838360005b8381101561036757808201518184015260208101905061034c565b50505050905090810190601f1680156103945780820380516001836020036101000a031916815260200191505b5088810386528d818151815260200191508051906020019080838360005b838110156103cd5780820151818401526020810190506103b2565b50505050905090810190601f1680156103fa5780820380516001836020036101000a031916815260200191505b5088810385528c818151815260200191508051906020019080838360005b83811015610433578082015181840152602081019050610418565b50505050905090810190601f1680156104605780820380516001836020036101000a031916815260200191505b5088810384528b818151815260200191508051906020019080838360005b8381101561049957808201518184015260208101905061047e565b50505050905090810190601f1680156104c65780820380516001836020036101000a031916815260200191505b5088810383528a818151815260200191508051906020019080838360005b838110156104ff5780820151818401526020810190506104e4565b50505050905090810190601f16801561052c5780820380516001836020036101000a031916815260200191505b50888103825289818151815260200191508051906020019080838360005b8381101561056557808201518184015260208101905061054a565b50505050905090810190601f1680156105925780820380516001836020036101000a031916815260200191505b509e50505050505050505050505050505060405180910390f35b34156105b757600080fd5b610613600480803560ff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610d09565b005b6000600160009054906101000a900460ff16905090565b610634610d57565b878160000181905250868160200181905250858160400181905250848160400181905250838160800181905250828160a00181905250818160c00181905250428160e0018181525050428161010001818152505080600080600160009054906101000a900460ff1660ff16815260200190815260200160002060008201518160000190805190602001906106c9929190610dce565b5060208201518160010190805190602001906106e6929190610dce565b506040820151816002019080519060200190610703929190610dce565b506060820151816003019080519060200190610720929190610dce565b50608082015181600401908051906020019061073d929190610dce565b5060a082015181600501908051906020019061075a929190610dce565b5060c0820151816006019080519060200190610777929190610dce565b5060e0820151816007015561010082015181600801559050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff160217905550505050505050505050565b6107d4610e4e565b6107dc610e4e565b6107e4610e4e565b6107ec610e4e565b6107f4610e4e565b6107fc610e4e565b610804610e4e565b6000808960ff1681526020019081526020016000206000016000808a60ff1681526020019081526020016000206001016000808b60ff1681526020019081526020016000206002016000808c60ff1681526020019081526020016000206003016000808d60ff1681526020019081526020016000206004016000808e60ff1681526020019081526020016000206005016000808f60ff168152602001908152602001600020600601868054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109415780601f1061091657610100808354040283529160200191610941565b820191906000526020600020905b81548152906001019060200180831161092457829003601f168201915b50505050509650858054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109dd5780601f106109b2576101008083540402835291602001916109dd565b820191906000526020600020905b8154815290600101906020018083116109c057829003601f168201915b50505050509550848054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a795780601f10610a4e57610100808354040283529160200191610a79565b820191906000526020600020905b815481529060010190602001808311610a5c57829003601f168201915b50505050509450838054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b155780601f10610aea57610100808354040283529160200191610b15565b820191906000526020600020905b815481529060010190602001808311610af857829003601f168201915b50505050509350828054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610bb15780601f10610b8657610100808354040283529160200191610bb1565b820191906000526020600020905b815481529060010190602001808311610b9457829003601f168201915b50505050509250818054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610c4d5780601f10610c2257610100808354040283529160200191610c4d565b820191906000526020600020905b815481529060010190602001808311610c3057829003601f168201915b50505050509150808054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610ce95780601f10610cbe57610100808354040283529160200191610ce9565b820191906000526020600020905b815481529060010190602001808311610ccc57829003601f168201915b505050505090509650965096509650965096509650919395979092949650565b806000808460ff1681526020019081526020016000206005019080519060200190610d35929190610e62565b50426000808460ff168152602001908152602001600020600801819055505050565b61012060405190810160405280610d6c610ee2565b8152602001610d79610ee2565b8152602001610d86610ee2565b8152602001610d93610ee2565b8152602001610da0610ee2565b8152602001610dad610ee2565b8152602001610dba610ee2565b815260200160008152602001600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610e0f57805160ff1916838001178555610e3d565b82800160010185558215610e3d579182015b82811115610e3c578251825591602001919060010190610e21565b5b509050610e4a9190610ef6565b5090565b602060405190810160405280600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610ea357805160ff1916838001178555610ed1565b82800160010185558215610ed1579182015b82811115610ed0578251825591602001919060010190610eb5565b5b509050610ede9190610ef6565b5090565b602060405190810160405280600081525090565b610f1891905b80821115610f14576000816000905550600101610efc565b5090565b905600a165627a7a723058207f857ead01cc87fdaba7f154886314b53e06dcdc9a4702d8e61d8540b32d83fe0029");


abiProductContract.new("", {from:coinbase, data: articleCode, gas: 3000000},function(err, deployedContract){
   if(!err) {
      if(!deployedContract.address) {
          //console.log(deployedContract.transactionHash)
      } else {
          var articleContract = abiProductContract.at(deployedContract.address);
     articleContract.addNewProduct(title, license, price, type, company, status,comment, {from:coinbase, gas: 4712388,
 gasPrice: 100000000000}, function(error){
       if(error){
           res1.render('writer', {errors:'Error While creating Product',user:req.user});
       }else {
               MongoClient.connect(url, function(err, db) {
               if (err) throw err;
               var myobj = {
                  contractAddress:deployedContract.address,
                   title    :  title,
                   company  :  company,
                   status   :  status,
                   type     :  type,
                   price    :  price,
                   license  :  license,
                   comment  :  comment
               }
                db.collection("product").insertOne(myobj, function(err, doc) {
               if (err) {
                   throw err;
               }
               });
            });
          }
       })
     }
   }
 });
 res1.render('writer',{ok:'Successfully created article'});
}else{
    res1.render('writer', {errors:'You dont have privilage to create article'});
        }
    });
  });
});
});
}
});

router.post('/register', function (req, res) {
  req.checkBody('fullIdentity', 'fullIdentity field cannot be empty').notEmpty();
  req.checkBody('email', 'email field cannot be empty').notEmpty();
  req.checkBody('password', 'password field cannot be empty').notEmpty();
  req.checkBody('role', 'Please select Role').notEmpty();
  req.checkBody('secretcode', 'Secret code field cannot be empty').notEmpty();
  const errors = req.validationErrors();
  if(errors){
  res.render('register', {errors:"Please check this field"});
  }else{
  MongoClient.connect(url, function(err, db) {
  var result = [];
  var query = {'email':req.body.email};
  var display={'contractAddress':1}
  var cursor = db.collection('register').find(query,display);
    cursor.forEach(function(doc, err) {
      result.push(doc);
    }, function() {
    if(result[0]==undefined){
    if(req.body.secretcode == 11421){
      web3.eth.defaultAccount= coinbase;
      var fullIdentity = req.body.fullIdentity;
      var email=req.body.email;
      var pass=req.body.password;
      var role=req.body.role;
      var abiContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"GetCount","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"fullIdentity","type":"string"},{"name":"email","type":"string"},{"name":"password","type":"string"},{"name":"role","type":"string"}],"name":"newAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"CountNo","type":"uint8"}],"name":"getAccount","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]);
      idCode = ("60606040526000600160006101000a81548160ff021916908360ff160217905550341561002b57600080fd5b6108e58061003a6000396000f300606060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630ab939711461005c5780635768dd881461008b5780636c3aa54d146101b1575b600080fd5b341561006757600080fd5b61006f610394565b604051808260ff1660ff16815260200191505060405180910390f35b341561009657600080fd5b6101af600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919050506103ab565b005b34156101bc57600080fd5b6101d5600480803560ff169060200190919050506104ac565b6040518080602001806020018060200180602001858103855289818151815260200191508051906020019080838360005b83811015610221578082015181840152602081019050610206565b50505050905090810190601f16801561024e5780820380516001836020036101000a031916815260200191505b50858103845288818151815260200191508051906020019080838360005b8381101561028757808201518184015260208101905061026c565b50505050905090810190601f1680156102b45780820380516001836020036101000a031916815260200191505b50858103835287818151815260200191508051906020019080838360005b838110156102ed5780820151818401526020810190506102d2565b50505050905090810190601f16801561031a5780820380516001836020036101000a031916815260200191505b50858103825286818151815260200191508051906020019080838360005b83811015610353578082015181840152602081019050610338565b50505050905090810190601f1680156103805780820380516001836020036101000a031916815260200191505b509850505050505050505060405180910390f35b6000600160009054906101000a900460ff16905090565b6103b36107ab565b84816000018190525083816020018190525082816040018190525081816060018190525080600080600160009054906101000a900460ff1660ff16815260200190815260200160002060008201518160000190805190602001906104189291906107ec565b5060208201518160010190805190602001906104359291906107ec565b5060408201518160020190805190602001906104529291906107ec565b50606082015181600301908051906020019061046f9291906107ec565b509050506001600081819054906101000a900460ff168092919060010191906101000a81548160ff021916908360ff160217905550505050505050565b6104b461086c565b6104bc61086c565b6104c461086c565b6104cc61086c565b6000808660ff1681526020019081526020016000206000016000808760ff1681526020019081526020016000206001016000808860ff1681526020019081526020016000206002016000808960ff168152602001908152602001600020600301838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105c15780601f10610596576101008083540402835291602001916105c1565b820191906000526020600020905b8154815290600101906020018083116105a457829003601f168201915b50505050509350828054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561065d5780601f106106325761010080835404028352916020019161065d565b820191906000526020600020905b81548152906001019060200180831161064057829003601f168201915b50505050509250818054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106f95780601f106106ce576101008083540402835291602001916106f9565b820191906000526020600020905b8154815290600101906020018083116106dc57829003601f168201915b50505050509150808054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107955780601f1061076a57610100808354040283529160200191610795565b820191906000526020600020905b81548152906001019060200180831161077857829003601f168201915b5050505050905093509350935093509193509193565b6080604051908101604052806107bf610880565b81526020016107cc610880565b81526020016107d9610880565b81526020016107e6610880565b81525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061082d57805160ff191683800117855561085b565b8280016001018555821561085b579182015b8281111561085a57825182559160200191906001019061083f565b5b5090506108689190610894565b5090565b602060405190810160405280600081525090565b602060405190810160405280600081525090565b6108b691905b808211156108b257600081600090555060010161089a565b5090565b905600a165627a7a72305820daaf990c1d1c20b0328cd1b612bd84a0e4736bde934ed34f61e17864041df0a10029");

      abiContract.new("", {from:coinbase, data: idCode, gas: 3000000},function(err, deployedContract){
        if(!err) {
           if(!deployedContract.address) {
               //console.log(deployedContract.transactionHash)
           } else {
               var identityContract = abiContract.at(deployedContract.address);
          identityContract.newAccount(fullIdentity, email, pass, role, {from:coinbase, gas: 4712388,
      gasPrice: 100000000000}, function(error){
            if(error){
                //console.log(error);
                res.render('register', {errors:'Error While creating Identity '});
            }else {
                    if (err) throw err;
                    var myobj = {
                      contractAddress:deployedContract.address,
                       fullIdentity: fullIdentity,
                       email: email,
                       role: role
                    }
                     db.collection("register").insertOne(myobj, function(err, doc) {
                    if (err) {
                        throw err;
                    }
                    else{
                    res.redirect('/');
                    }

                    });
               }
            })
        }
      }
      });
    }else{
      res.render('register', {error:'Please provide correct secret code to Register'});
    }

}else{
res.render('register', {error:'This Email is already Registred!!! Please Login to continue'});
}
});
});
}

});

router.get('/register', function (req, res) {

  res.render('register');

});

router.get('/logout', function(req, res){
  //req.flash('success_msg', 'You are logged out');
	req.logout();
  req.session.destroy(function() {
  res.status(200).clearCookie('connect.sid', {path: '/'}).json({status: "Success"});
  res.redirect('/');
});

	res.redirect('/');
});
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});
function authenticationMiddleware () {
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
	    if (req.isAuthenticated()) return next();
	    res.redirect('/')
	}
}

module.exports = router;

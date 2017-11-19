require("babel-polyfill");
const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
let GiantToken = artifacts.require("./GiantToken.sol", )
let StandardToken = artifacts.require("./token/StandardToken.sol");


//web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [86400], id: 0})

var bitcoin = require('bitcoin');
var client = new bitcoin.Client({
  host: 'localhost',
  port: 18332,
  user: 'bitcoin',
  pass: 'local321'
});



contract('', function(accounts) {

  var ownerAccount = accounts[0];
    
  const params = {
    _tokenCap: 21000000,
    _numberOfTeamTokens: 3000000,
    _startTime: 0,
    _wallet: ownerAccount,
    _teamWallet: ownerAccount
  };

  var instance;
  var pow = Math.pow(10, 18);

  before('Setup contract', async function() {   
    GiantToken.deployed().then(function(_instance) {
        instance = _instance;        
    })
  })  

  it("Should check number of team tokens", function(done) {
    instance.balanceOf.call(ownerAccount).then(function(balance) {
        assert.equal(balance.valueOf(), params._numberOfTeamTokens * pow, "Number of team tokens is invalid");
        done()
    });
  });

  it("Should check that ICO is started", function(done) {
    instance.hasStarted.call().then(function(isStarted) {
      assert.equal(isStarted, true, "ICO not started but should")
      done()
    })
  })

  it("Should check that ICO is not succeed", function(done) {
    instance.isSucceed.call().then(function(value) {
      assert.equal(value, false, "ICO is succeed but should not");
      done();
    })
  })

  it("Should check that ICO is not ended", function(done) {
    instance.hasEnded.call().then(function(value) {
      assert.equal(value, false, "ICO is ended but should not")
      done()
    })
  })

  it("Sending 0.33 ether", function(done) {
    instance.buy({from: accounts[3], value: web3.utils.toWei(0.33, "ether"), data: "1M7AxbrMdYgi2nuMV334keKkmJT7MK3jbB"})
    .then(function(tx) {
      assert.isOk(tx.receipt)      
      done();
    })
  })

  it("Investor should have 128 tokens", function(done) {
    instance.balanceOf(accounts[3]).then(function(balance) {
        assert.equal(128700000000000000000, balance.valueOf(), "Number of tokens is invalid");
        done()
    });
  });

  /*
  it("Buying 8m tokens", function(done) {
    instance.buy({from: accounts[3], value: web3.utils.toWei(27000, "ether"), data: "1M7AxbrMdYgi2nuMV334keKkmJT7MK3jbB"})
    .then(function(tx) {
      assert.isOk(tx.receipt)      
      done();
    })
  })
  */

  it("Should send btc, check after time number of tokens", function(done) {
    client.cmd('sendfrom', "1", "moFft8DzJxVQkirDrrkUYGsE4vsyKQ8hH1", 0.00001, function (err, tid) {
      assert.equal(err, null, "Bitcoin tx not is send");
      done();  
    });    
  })

  function printBalances(accounts) {
    accounts.forEach(function(ac, i) {
      console.log(i, web3.fromWei(web3.eth.getBalance(ac), 'ether').toNumber())
    })
  }

})


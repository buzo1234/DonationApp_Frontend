
import React, { useState, useEffect } from 'react';
import DonationContract from './contracts/DonationContract.json';
import Web3 from 'web3';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [donor, setDonor] = useState('');
  const [balance, setBalance] = useState(0);
  const [reqcount, setCount ] = useState(0);
  const [askAmount, setAskAmount] = useState(0);
  const [reason, setReason] = useState('');

  const [allrequests, setAllRequests] = useState([]);

  const [donations, setDonations] = useState([]);


  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3Provider = new Web3.providers.HttpProvider(
          'http://localhost:7545'
        );
        const web3 = new Web3(web3Provider);
        setWeb3(web3)

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        console.log(accounts);
        setAccounts(accounts);

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = DonationContract.networks[networkId];
        const contract = new web3.eth.Contract(
          DonationContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contract);
        handlegetAll();
      } catch (error) {
        console.error('Error: ', error);
      }
    };
    init();
  }, []);

  const getBalance = async (event) => {
    event.preventDefault();
    var bal = await contract.methods.getBalance().call();
    console.log("Balance is " + bal);
    setBalance(bal);
  }

  

  const handleDonate = async (event) => {
    event.preventDefault();

    const weiAmount = web3.utils.toWei(donationAmount.toString(), 'ether');
    console.log("wei : " + weiAmount);
    try {
      var bal = await contract.methods.donate().send({
        from: donor,
        value: weiAmount,
        gasValue: 800000
       
      });
      console.log("balance is " + bal.toString())
      alert('Donation successful!' + bal);
      setDonor('');
      setDonationAmount(0);
    } catch (error) {
      alert(`Donation failed: ${error.message}`);
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();

    try {
      await contract.methods.releaseFunds().send({ from: accounts[0], gas:800000 });
    
      alert('Funds released to NGO!');
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  const handleSpendAll = async (event) => {
    event.preventDefault();

    try {
      await contract.methods.approveAllSpendingRequests().send({ from: accounts[0], gas:800000 });
      await handlegetAll();
      alert('Funds released to NGO!');
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  const createSpendRequest = async (event) => {
    event.preventDefault();

    try {
      const weiAmount = web3.utils.toWei(askAmount.toString(), 'ether');
      var gas = await contract.methods.createSpendingRequest(reason, weiAmount, "0x9906F1C187ba9FA5c4306E4c6D7f4284D96D33ec" ).send({ from: accounts[0], gas: 2000000});
      await handlegetAll();
      
      alert('Created a spending Request' + gas);
    } catch (error) {
      alert(`Spending request creation failed: ${error.message}`);
    }
  };

  const handlegetAll = async (event) => {
   

    try{
      var arr = await contract.methods.getAllRequests().call();
      setAllRequests(arr);
      console.log(arr);
    }catch(error){
      alert(error);
    }
  }

  const createSpendRequestCount = async (event) => {
    event.preventDefault();

    try {
      var count = await contract.methods.getSpendingRequestCount().call();
      alert(count);
      setCount(count);
      alert('Funds released to NGO!');
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
    
      /* const spentAmount = await contract.methods.spentAmount().call();
      setSpentAmount(spentAmount);
      const spendingApproved = await contract.methods
        .spendingApproved()
        .call();
      setSpendingApproved(spendingApproved); */
    };

    if (contract) {
      fetchData();
    }
  }, [contract]);

  return (
    <div className='bg-gradient-to-br from-cyan-700 to-blue-700 h-full text-white px-5 pb-12 '>
      <div className='max-w-4xl mx-auto'>

      
      <h1 className='text-center text-3xl font-bold font-sans py-10'>Donation App</h1>

    
      <h2 className='font-semibold mb-2'>Donate to the NGO</h2>
      
      <form onSubmit={handleDonate} className='w-full px-3 py-3 rounded-lg bg-white shadow-md text-black flex flex-col'>
        <div className='flex justify-between'>

       
        <label>
          Donor address:
          <input
            type='text'
            value={donor}
            className='mx-3 text-black bg-transparent border-b-4 border-black'
            onChange={(event) => setDonor(event.target.value)}
          />
        </label>
        <br />
        <label>
          Donation amount:
          <input
            type='number'
            value={donationAmount}
            className='mx-3 text-black bg-transparent border-b-4 border-black'
            onChange={(event) => setDonationAmount(event.target.value)}
          />
        </label>
        <br />
        </div>
        <input type="submit" value={"Donate"} className='px-3 py-2 bg-black rounded-md text-white font-smibold mt-10 cursor-pointer'/>
        </form>

        

        <h1 className='font-semibold mb-2 mt-10'>Withdraw by NGO</h1>
        <form onSubmit={handleWithdraw}  className='w-full px-3 py-3 rounded-lg bg-white shadow-md text-black flex flex-col'>
        <p>Withdraw all the approved Amount?</p>
        <input type="submit"  value={"Witdraw"} className='px-3 py-2 bg-black rounded-md text-white font-smibold mt-10 cursor-pointer' />
        </form>

        <h1 className='font-semibold mb-2 mt-10'>Approve All Spending Requests?</h1>
        
        <form onSubmit={handleSpendAll} className='w-full px-3 py-3 rounded-lg bg-white shadow-md text-black flex flex-col'>
        <p>This will approve all spending requests made by the NGO</p>
        <input type="submit"  value={"Approve All"}  className='px-3 py-2 bg-black rounded-md text-white font-smibold mt-10 cursor-pointer'/>
        </form>

        <table className='w-full text-center border-separate border-spacing-2 border border-black mt-4 mb-2'>
          
            <tr className="border-2 border-black">
              <th>Request ID</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Receiver</th>
              <th>Approval</th>
            </tr>
          
          {allrequests.map((val, index) => {
            return <tr className='w-full'>
              <td className='text-sm w-[100px] overflow-hidden'>{index}</td>
              <td className='text-sm w-[100px] overflow-hidden'>{val.description}</td>
              <td className='text-sm w-[100px] overflow-hidden'>{val.amount}</td>
              <td className='text-sm w-[100px] overflow-hidden'>{val.recipient}</td>
              <td className={val.approved ? 'text-sm w-[100px] overflow-hidden bg-green-500' : 'text-sm w-[100px] overflow-hidden bg-red-500' }>{val.approved ? "Approved" : "Pending"}</td>
            </tr>
          })}
        </table>

        <h1 className='font-semibold mb-2 mt-10'>Create Spend Request</h1>

        <form onSubmit={createSpendRequest} className='w-full  px-3 py-3 rounded-lg bg-white shadow-md text-black flex flex-col'>
          <div className='flex justify-between'>

       
        <label>
         Reason:
          <input
            type='text'
            value={reason}
            className='mx-3 text-black bg-transparent border-b-4 border-black'
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <br />
        <label>
          Requested amount:
          <input
            type='number'
            value={askAmount}
            className='mx-3 text-black bg-transparent border-b-4 border-black'
            onChange={(event) => setAskAmount(event.target.value)}
          />
        </label>
        <br />
        </div>
        

        <input type="submit"  value={"Create Request"}   className='px-3 py-2 bg-black rounded-md text-white font-smibold mt-10 cursor-pointer'/>
        </form>


        <p className='text-center mt-20'>Made with ❤️ by Karan, Prathamesh and Deepak</p>


        </div>
        </div>



    )
}

export default App;
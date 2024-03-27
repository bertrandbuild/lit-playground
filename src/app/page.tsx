'use client'

import { useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { EvmContractConditions } from '@lit-protocol/types';
import lit from './lit'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: client } = useWalletClient();
  
  useEffect(() => {
    (async () => {
      await lit.connect();
    })();
  }, []);
  
  async function run() {
    if (!client) {
      console.log("no client");
      return;
    };

    console.log("starting");

    const accs: EvmContractConditions = [{ // check if the user balance of the following contract (TalentLayerId) is greater than 0
      conditionType: "evmContract",
      contractAddress: '0x3F87289e6Ec2D05C32d8A74CCfb30773fF549306',
      functionName: "balanceOf",
      functionParams: [":userAddress"],
      functionAbi: {
        type: "function",
        stateMutability: "view",
        outputs: [
          {
            type: "uint256",
            name: "",
            internalType: "uint256",
          },
        ],
        name: "balanceOf",
        inputs: [
          {
            type: "address",
            name: "account",
            internalType: "address",
          },
        ],
      },
      chain: "mumbai",
      returnValueTest: {
        key: "",
        comparator: ">",
        value: "0",
      },
    }];

    const accsTest2 = [
      {
          "conditionType": "evmBasic",
          "contractAddress": "0x3F87289e6Ec2D05C32d8A74CCfb30773fF549306",
          "standardContractType": "ERC20",
          "chain": "mumbai",
          "method": "balanceOf",
          "parameters": [
              ":userAddress"
          ],
          "returnValueTest": {
              "comparator": ">=",
              "value": "1"
          }
      }
  ];

    const data = await lit.encrypt(
      client,
      accsTest2,
      "Encrypted message",
    );

    console.log(data);

    const result = await lit.decrypt(
      client,
      data.ciphertext,
      data.dataToEncryptHash,
      accsTest2,
    );

    console.log(result);

  }

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>

        {account.status === 'connected' ? (
          <button
            onClick={run}
            type="button"
          >
            Lit : Encrypt + Decrypt
          </button>
        ) : (
          <>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
              >
                {connector.name}
              </button>
            ))}
          </>
        )}
        
        
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  )
}

export default App

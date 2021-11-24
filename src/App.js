import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'
import Big from 'big.js';
import { transactions } from "near-api-js";

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();
const ONE_YOCTO_NEAR = "1";
const ONE_NEAR = Big(1).times(10 ** 24).toFixed();

import getConfig from './config'
const { networkId, contractName } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  const [balance, set_balance] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.ft_balance_of({ account_id: window.accountId })
          .then(val => {
            val = val / 10 ** 8
            set_balance(val)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEARVEMBER Challenge 6!</h1>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          MEME Token balance of {window.accountId}
          <br />
          <label
            htmlFor="balance"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
          {balance}
          </label>
        </h1>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { buyForm } = event.target.elements

          // disable the form while the value gets updated on-chain
          buyForm.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.buy_tokens(
              {
                account_id: window.accountId,
              },
              BOATLOAD_OF_GAS,
              ONE_NEAR
            )
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            buyForm.disabled = false
          }
        }}>
          <fieldset id="buyForm">
            <div style={{ display: 'flex' }}>
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '5px 5px 5px 5px', margin: 2 }}
              >
                Buy 100 MEME for 1 NEAR
              </button>
            </div>
          </fieldset>
        </form>

        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, toAccount, toAmount } = event.target.elements

          const toAccountId = toAccount.value
          const toAmountVal = toAmount.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // await window.walletConnection.account().signAndSendTransaction({
            //   receiverId: contractName,
            //   actions: [
            //     transactions.functionCall(
            //       "storage_deposit", Buffer.from(JSON.stringify({ account_id: toAccountId })), BOATLOAD_OF_GAS,   Big(0.00125).times(10 ** 24).toFixed()
            //     ),
            //     transactions.functionCall(
            //       "ft_transfer",
            //       Buffer.from(JSON.stringify({
            //         receiver_id: toAccountId,
            //         amount: toAmountVal
            //       })),
            //       BOATLOAD_OF_GAS,
            //       ONE_YOCTO_NEAR,
            //     ),
            //   ],
            // });

            await window.contract.send_tokens(
              {
                receiver_id: toAccountId,
                amount: Big(toAmountVal).times(10 ** 8).toFixed()
              },
              BOATLOAD_OF_GAS,
              Big(0.00125).times(10 ** 24).add(ONE_YOCTO_NEAR).toFixed()
            )
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="toAccount"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Transfer MEME Token to
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue="testdev.testnet"
                placeholder="your-friend.testnet"
                id="toAccount"
                required={true}
                style={{ flex: 1, margin: 2 }}
              />
              <input
                autoComplete="off"
                defaultValue="10"
                placeholder="Amount"
                datatype="number"
                id="toAmount"
                required={true}
                style={{ flex: 1, margin: 2 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '5px 5px 5px 5px', margin: 2 }}
              >
                Send
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </>
  )
}

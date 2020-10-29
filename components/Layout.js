import Head from 'next/head'
import Header from "./Header"
import { LoginModal } from './LoginModal'
import { Modal } from './Modal'
import { RegistrationModal } from './RegistrationModal'

import { useStoreState, useStoreActions } from 'easy-peasy'

const Layout = ({ content }) => {
  let { showModal, showLoginModal, showRegistrationModal } = useStoreState((state) => state.modals)
  let { setHideModal, setShowRegistartionModal, setShowLoginModal } = useStoreActions(actions => actions.modals)
  return (<div>
    <Head>
      <script src="https://js.stripe.com/v3/"></script>
    </Head>
    <Header />
    <main>{content}</main>
    {showModal && <Modal close={setHideModal}>
      {showLoginModal && <LoginModal
        showSignup={setShowRegistartionModal}
      />}
      {showRegistrationModal && <RegistrationModal
        showLogin={setShowLoginModal}
      />}
    </Modal>}
    <style jsx global>
      {`
        body {
          margin: 0;
          font-family:Roboto,-apple-system,BlinkMacSystemFont,SegoeUI,Oxygen,Ubuntu,Cantarell,FiraSans,DroidSans,HelveticaNeue,sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
      `}
    </style>
    <style jsx global>
      {`
          main {
            position: relative;
            max-width: 56rem;
            background-color: white;
            padding: 2em;
            margin: 0 auto;
            box-sizing: border-box;
          }
          button {
            background-color: rgb(255,90,95);
            color: white;
            font-size: 13px;
            width: 100%;
            border: none;
            height: 40px;
            border-radius:4px;
            cursor: pointer;
          }
          input[type='text'],
          input[type='email'],
          input[type='password'] {
            display: block;
            padding: 20px;
            font-size: 20px !important;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
        `}
    </style>
  </div>)
}

export default Layout
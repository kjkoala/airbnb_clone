import Link from 'next/link'
import { useStoreActions, useStoreState } from 'easy-peasy'
import axios from 'axios'

const Header = () => {
  const { user } = useStoreState(state => state.user)
  const { setUser } = useStoreActions(({ user }) => user)
  const setShowLoginModal = useStoreActions((actions) => actions.modals.setShowLoginModal)

  const setShowRegistrationModal = useStoreActions((actions) => actions.modals.setShowRegistartionModal)
  return (<div className="nav-container">
    <Link href="/">
      <a>
        <img src="/img/logo.svg" width="40" />
      </a>
    </Link>
    <nav>
      <ul>
        {user ? <>
          <li className="username"><a>{user}</a></li>
          <li className="username">
            <Link href="/host">
              <a>Your houses</a>
            </Link>
          </li>
          <li className="username">
            <Link href="/host/new">
              <a>Add House</a>
            </Link>
          </li>
          <li className="username"><a href="#" onClick={async () => {
            await axios.post('/api/auth/logout');
            setUser(null)
          }}>Log out</a></li>
        </> :
          <>
            <li>
              <a href="#" onClick={setShowLoginModal}>Log in</a>
            </li>
            <li>
              <a href="#" onClick={setShowRegistrationModal}>Sign in</a>
            </li>
          </>
        }
      </ul>
    </nav>
    <style jsx>
      {`
      .username {
        padding: 1em 0.5em;
      }
        ul {
          margin: 0;
          padding: 0;
        }
        li {
          display: block;
          float: left;
        }
        a {
          text-decoration: none;
          display: block;
          margin-right: 15px;
          color: #333;
        }
        nav {
         margin-left: auto;
        }
        nav a {
          padding: 1em 0.5em;
        }
          .nav-container {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #eee;
            height: 50px;
          }
          img {
              float:left;
            }
        `}
    </style>
  </div>)
}

export default Header;
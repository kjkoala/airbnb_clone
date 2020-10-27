import House from '../components/House';
import Layout from '../components/Layout';

import fetch from 'isomorphic-unfetch';


const Index = ({ houses }) => {

  const content = (<div>
    <h2>Place to stay</h2>
    <div className="houses">
      {houses.map((house) => <House key={house.id} {...house} />)}
    </div>
    <style jsx> {`
    .houses {
      display:grid;
      grid-template-columns:50% 50%;
      grid-template-rows:300px 300px;
      grid-gap:40px;
    }
    `}
    </style>
  </div>)

  return <Layout content={content} />
}

Index.getInitialProps = async () => {
  const res = await fetch('http://localhost:3000/api/houses')
  const houses = await res.json()
  return { houses }
}

export default Index;
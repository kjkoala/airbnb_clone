import axios from 'axios'
import Head from 'next/head'

import { HouseForm } from '../../components/HouseForm'
import Layout from '../../components/Layout'

const EditHouse = ({ house }) => {

  return (<Layout
    content={<>
      <Head>
        <title>Edit house page</title>
      </Head>
      <HouseForm
        edit
        house={house}
      />
    </>}
  />)
}

EditHouse.getInitialProps = async ({ query }) => {
  const { id } = query
  const response = await axios.get('http://localhost:3000/api/houses/' + id)
  return ({ house: response.data })
}

export default EditHouse
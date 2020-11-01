import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Editor from 'react-pell'



export const HouseForm = ({ house, edit }) => {
  const router = useRouter()

  const id = (house && house.id) || null

  const c = (name) => (house && house[name])

  const [title, setTitle] = useState(c('title') || '')
  const [town, setTown] = useState(c('town') || '')
  const [price, setPrice] = useState(c('price') || 0)
  const [picture, setPicture] = useState(c('picture') || '')
  const [description, setDescription] = useState(c('description') || '')
  const [guests, setGuests] = useState(c('guests') || 0)
  const [bedrooms, setBedrooms] = useState(c('bedrooms') || 0)
  const [beds, setBeds] = useState(c('beds') || 0)
  const [baths, setBaths] = useState(c('baths') || 0)
  const [wifi, setWifi] = useState(c('wifi') || false)
  const [kitchen, setKitchen] = useState(c('kitchen') || false)
  const [heating, setHeating] = useState(c('heating') || false)
  const [freeParking, setFreeParking] = useState(c('freeParking') || false)
  const [entirePlace, setEntirePlace] = useState(c('entirePlace') || false)
  const [type, setType] = useState(c('type') || 'Entire house')

  const houseType = ['Entire house', 'Room']

  return (<div>
    <form onSubmit={async (event) => {
      event.preventDefault();
      try {
        const response = await axios.post(
          `/api/host/${edit ? 'edit' : 'new'}`, {
          house: {
            id: edit ? id : null,
            title,
            town,
            price,
            picture,
            description,
            guests,
            bedrooms,
            beds,
            baths,
            wifi,
            kitchen,
            heating,
            freeParking,
            entirePlace,
            type
          }
        })

        if (response.data.status === 'error') {
          alert(response.data.message)
          return
        }
        router.push('/host')
      } catch (e) {
        console.error(e)
        return
      }
    }}>
      <p>
        <label>House title</label>
        <input
          required
          type="text"
          id="title"
          placeholder="House title"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </p>
      <p>
        <label>Town</label>
        <input
          required
          type="text"
          id="town"
          placeholder="Town"
          onChange={(event) => setTown(event.target.value)}
          value={town}
        />
      </p>
      <p>
        <label>Price per night</label>
        <input
          required
          type="number"
          id="price"
          placeholder="Price per night"
          onChange={(event) => setPrice(event.target.value)}
          value={price}
        />
      </p>
      <p>
        <label>House picture</label>
        <input
          required
          type="file"
          id="picture"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files
            const formData = new FormData();
            formData.append('image', file[0])
            const response = await axios.post('/api/host/image', formData)
            setPicture('http://localhost:3000' + response.data.path)
          }}
        />
        {picture && <img src={picture} width="200" alt="House img" />}
      </p>
      <p>
        <div>
          <Editor
            onChange={(html) => setDescription(html)}
            defaultContent={description}
            actions={['bold', 'underline', 'italic']}
          />
        </div>
      </p>
      <p>
        <label>Number of guests</label>
        <input
          required
          type="number"
          id="guests"
          placeholder="Number of guests"
          onChange={(event) => setGuests(event.target.value)}
          value={guests}
        />
      </p>
      <p>
        <label>Number of bedrooms</label>
        <input
          required
          type="number"
          id="bedrooms"
          placeholder="Number of bedrooms"
          onChange={(event) => setBedrooms(event.target.value)}
          value={bedrooms}
        />
      </p>
      <p>
        <label>Number of beds</label>
        <input
          required
          type="text"
          id="beds"
          placeholder="Number of beds"
          onChange={(event) => setBeds(event.target.value)}
          value={beds}
        />
      </p>
      <p>
        <label>Number of baths</label>
        <input
          required
          type="number"
          id="baths"
          placeholder="Number of baths"
          onChange={(event) => setBaths(event.target.value)}
          value={baths}
        />
      </p>
      <p>
        <label>Does it have wifi?</label>
        <select
          onChange={(event) => setWifi(event.target.value)}
          value={wifi}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </p>
      <p>
        <label>Does it have kitchen?</label>
        <select
          onChange={(event) => setKitchen(event.target.value)}
          value={kitchen}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </p>
      <p>
        <label>Does it have heating?</label>
        <select
          onChange={(event) => setHeating(event.target.value)}
          value={heating}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </p>
      <p>
        <label>Does it have free parking?</label>
        <select
          onChange={(event) => setFreeParking(event.target.value)}
          value={freeParking}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </p>
      <p>
        <label>Is it the entire place?</label>
        <select
          onChange={(event) => setEntirePlace(event.target.value)}
          value={entirePlace}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
      </p>
      <p>
        <label>Type of house</label>
        <select
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          {houseType.map((item, key) => {
            <option key={key} value={item}>{item}</option>
          })}
        </select>
      </p>
      <button type="submit">{edit ? 'Edit house' : 'Add house'}</button>
    </form>
    <style global jsx>{`
            .pell-container {
              border: 1px solid #ccc;
            }
            .pell, .pell-content {
              box-sizing: border-box;
            }
            .pell-content {
              height: 300px;
              outline: 0;
              overflow-y: auto;
              padding: 10px;
            }
            .pell-actionbar {
              background-color: #fff;
              border-bottom: 1px solid hsla(0, 0%, 4%, 0.1)
            }
            .pell-button {
              background-color: transparent;
              border: none;
              cursor: pointer;
              height: 30px;
              outline: 0;
              width: 30px;
              vertical-align: bottom;
              color: black;
            }
            .pell-button-selected {
              background-color: #f0f0f0;
            }
            `}</style>

    <style jsx>
      {`
      input[type=number], input[type=file] select, textarea {
        display: block;
        padding: 20px;
        font-size: 20px !important;
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        margin-bottom: 10px;
      }
      form p {
        display: grid;
      }
      .gird {
        display: grid;
        grid-template-columns: 50% 50%;
      }
      .grid > div {
        padding: 50px;
      }
      `}
    </style>
  </div>)
}
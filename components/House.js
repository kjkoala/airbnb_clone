import Link from 'next/link'


const House = ({ picture, type, town, title, rating, reviewsCount, id }) => (
  <Link href="/houses/[id]" as={'/houses/'+id}>
    <a>
      <img src={picture} width="100%" alt="House picture" />
      <p>
        {type} - {town}
      </p>
      <p>
        {title}
      </p>
      <p>
        {rating} ({reviewsCount})
        </p>
    </a>
  </Link>
)

export default House
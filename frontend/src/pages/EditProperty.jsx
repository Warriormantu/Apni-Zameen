import { useParams } from 'react-router-dom'
import PropertyForm from '../components/PropertyForm'

export default function EditProperty() {
  const { id } = useParams()
  return <PropertyForm propertyId={id} />
} 
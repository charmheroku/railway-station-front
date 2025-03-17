export interface IStation {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface ITrain {
  id: number;
  name: string;
  number: string;
}

export interface ITrip {
  id: number;
  train: ITrain;
  origin: IStation;
  destination: IStation;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
}

export interface ITripList {
  id: number;
  train_number: string;
  train_name: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
}

export interface ITripDetail extends ITripList {
  duration: string;
  distance: string;
  amenities: IAmenity[];
  stops: IStop[];
}

export interface IAmenity {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface IStop {
  id: number;
  station: IStation;
  arrival_time: string;
  departure_time: string;
  stop_duration: string;
}

export interface IBooking {
  id: number;
  trip: ITrip;
  user: IUser;
  booking_date: string;
  seat_number: string;
  status: string;
  passengers: IPassenger[];
  total_price: number;
}

export interface IPassenger {
  id: number;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  phone_number: string;
  date_joined: string;
}

export interface ISearchFormData {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
} 
import {combineReducers, configureStore} from '@reduxjs/toolkit'
import ProductReducer from './slices/productsSlice'

const reducer = combineReducers({
    ProductsState: ProductReducer
})


const store = configureStore({
    reducer,
})

export default store
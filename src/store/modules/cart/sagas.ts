import { all, takeLatest, select, call, put } from 'redux-saga/effects';
import { addProductToCartRequest, addProductToCartSuccess, addProductToCartFailure } from './actions';
import { IState } from '../..';
import api from '../../../services/api';
import { AxiosResponse } from 'axios';
import { ActionTypes } from './types';

type ICheckProductStockRequest = ReturnType<typeof addProductToCartRequest>;

interface IStockResponse {
  id: string;
  quantity: number;
}

function* checkProductStock({ payload, type }: ICheckProductStockRequest) {
  const { product } = payload;

  const currentQuantity: number = yield select((state: IState) => {
    return state.cart.items.find(item => item.product.id === product.id)?.quantity || 0;
  });

  const availableStockResponse: AxiosResponse<IStockResponse> = yield call(api.get, `stock/${product.id}`);

  if (availableStockResponse.data.quantity > currentQuantity) {
    yield put(addProductToCartSuccess(product));
    console.log('deu certo');
  } else {
    yield put(addProductToCartFailure(product.id));
    console.log('falta de estoque');
  }

  console.log('checkProductStock:', currentQuantity);
}

export default all([
  takeLatest(ActionTypes.addProductToCartRequest, checkProductStock)
]);

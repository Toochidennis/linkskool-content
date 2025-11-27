import {
  create,
  getAll,
  getById,
  getWithParams,
  updateById,
  deleteById
} from "../methods";

export class BaseService<T, D = any> {
  constructor(private endpoint: string) {}

  create(payload: D) {
    return create<T, D>(this.endpoint, payload);
  }

  getAll() {
    return getAll<T>(this.endpoint);
  }

  getById(id: string | number) {
    return getById<T>(this.endpoint, id);
  }

  getWithParams(params: object) {
    return getWithParams<T>(this.endpoint, params);
  }

  update(id: string | number, payload: D) {
    return updateById<T, D>(this.endpoint, id, payload);
  }

  delete(id: string | number) {
    return deleteById<T>(this.endpoint, id);
  }
}

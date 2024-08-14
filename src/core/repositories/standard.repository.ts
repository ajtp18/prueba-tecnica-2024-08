export interface IRepository<E> {
  findAll(): Promise<E[]>;
  findById(id: number): Promise<E>;
  create(entiry: E): Promise<E>;
}
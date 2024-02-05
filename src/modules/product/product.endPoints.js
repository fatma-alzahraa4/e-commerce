import { systemRoles } from "../../utils/systemRoles.js"
export const productApisRoles = {
    ADD_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    DELETE_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    UPDATE_PRODUCT:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    GET_ALL_PRODUCTS:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
    GET_PRODUCT_BY_TITLE:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN],
    LIST_PRODUCTS:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN]
}

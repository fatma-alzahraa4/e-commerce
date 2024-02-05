import { systemRoles } from "../../utils/systemRoles.js"
export const subCategoryApisRoles = {
    CREATE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    DELETE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    UPDATE_SUBCATEGORY:[systemRoles.ADMIN,systemRoles.SUPERADMIN],
    GET_ALL_SUBCATEGORIES:[systemRoles.USER,systemRoles.ADMIN,systemRoles.SUPERADMIN]
}
import axiosClient from './axiosClient'

const userApis = {
  listUser() {
    return axiosClient.get('/user')
  },
  getStoreStaff(storeId) {
    return axiosClient.get(`/store-staff/${storeId}`)
  },
  userUpdate(id, data) {
    return axiosClient.put(`/user/${id}`, data)
  },
  getStaffByServiceCategory(cateId) {
    return axiosClient.get(`/staffByCategory/${cateId}`)
  },
  getStaffInTimeSlot(timeSlot, serviceId, date) {
    return axiosClient.get(`/staffInTimeSlot/${serviceId}?timeSlot=${timeSlot}&date=${date}`)
  },
}

export default userApis

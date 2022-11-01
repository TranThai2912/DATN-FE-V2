import { ViewState } from '@devexpress/dx-react-scheduler'
import {
  Appointments,
  AppointmentTooltip,
  DateNavigator,
  DayView,
  MonthView,
  Resources,
  Scheduler,
  TodayButton,
  Toolbar,
  ViewSwitcher,
  WeekView,
} from '@devexpress/dx-react-scheduler-material-ui'
import {
  Cancel,
  CheckCircle,
  CreditScore,
  Done,
  DoubleArrow,
  Edit,
  Workspaces,
} from '@mui/icons-material'
import {
  IconButton,
  MenuItem,
  Paper,
  Popper,
  Stack,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { amber } from '@mui/material/colors'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import calendarApi from '../../../../api/calendar'
import serviceApi from '../../../../api/service'
import userApis from '../../../../api/user'
import AlertCustom from '../../../../components/AlertCustom'
import GlassBox from '../../../../components/GlassBox'
import useAuth from '../../../../hook/useAuth'
import { setServices, setStatus } from '../../../../redux/slice/orderSlice'
import { getFullList } from '../../../../redux/slice/serviceRegisterSlice'
import formatPrice from '../../../../utils/formatPrice'
import getSocket from '../../../../utils/socket'
import DialogConfirm from './DialogConfirm'
import ModalEditOrder from './modal-form/ModalEditOrder'
import ModalPay from './modal-pay/ModalPay'
import { statusId } from '../../../../api/calendar'

const socket = getSocket('order')

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [resources, setResources] = useState()
  const [orderId, setOrderId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [openModalPay, setOpenModalPay] = useState(false)

  const [openAlert, setOpenAlert] = useState(true)
  const [alertInfo, setAlertInfo] = useState({
    message: '',
    type: '',
  })

  const theme = useTheme()
  const appointments = useSelector((state) => state.serviceRegister.listFiltered)
  const statuses = useSelector((state) => state.order.status)
  const dispatch = useDispatch()

  const { userInfo } = useAuth()

  // component

  const Header = ({ children, appointmentData, ...restProps }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const openPopper = Boolean(anchorEl)

    const handleOpenPopper = (event) => {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }

    const isPast = (date) => {
      const today = new Date()
      const thatDay = new Date(date)
      return today > thatDay
    }
    const isDone = (status) => {
      return status === statusId.done
    }

    const isPay = (status) => {
      return status === statusId.paid
    }

    const disableSuccess = (status) => {
      return (
        status === statusId.pending ||
        status === statusId.cancel ||
        status === statusId.done ||
        status === statusId.accepted
      )
    }

    const disablePayment = (status) => {
      return status !== statusId.done || status === statusId.paid
    }

    const disableStart = (status) => {
      return status !== statusId.accepted
    }

    const disableAccepted = (status) => {
      return status === statusId.accepted || status === statusId.done || status === statusId.doing
    }

    const disableCancel = (status) => {
      return status === statusId.doing || status === statusId.cancel
    }

    return (
      <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
        <Tooltip title='Trạng thái' placement='top'>
          <IconButton
            /* eslint-disable-next-line no-alert */
            onClick={handleOpenPopper}
            disabled={isPast(appointmentData.startDate) || isPay(appointmentData.status)}
            size='large'
          >
            <Workspaces />
          </IconButton>
        </Tooltip>
        <Popper open={openPopper} anchorEl={anchorEl} placement='top' sx={{ zIndex: 1500 }}>
          <Paper>
            <Stack>
              <MenuItem
                onClick={() => handleChangeStatus(appointmentData.id, 'accepted')}
                disabled={
                  disableAccepted(appointmentData.status) || isPast(appointmentData.startDate)
                }
              >
                <Stack direction='row' gap={1} alignItems='center'>
                  <CheckCircle color='info' fontSize='small' />
                  <Typography variant='body2'>Xác nhận</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                disabled={disableStart(appointmentData.status) || isPast(appointmentData.startDate)}
                onClick={() => handleChangeStatus(appointmentData.id, 'doing')}
              >
                <Stack direction='row' gap={1} alignItems='center'>
                  <DoubleArrow color='primary' fontSize='small' />
                  <Typography variant='body2'>Bắt đầu làm</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                disabled={
                  disableSuccess(appointmentData.status) || isPast(appointmentData.startDate)
                }
                onClick={() => {
                  setOrderId(appointmentData.id)
                  setDialogTitle('Xác nhận lịch đặt này đã hoàn thành ?')
                  setOpenDialog(true)
                }}
              >
                <Stack direction='row' gap={1} alignItems='center'>
                  <Done color='success' fontSize='small' />
                  <Typography variant='body2'>Hoàn thành</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                disabled={
                  disablePayment(appointmentData.status) || isPast(appointmentData.startDate)
                }
                onClick={() => {
                  setOrderId(appointmentData.id)
                  setOpenModalPay(true)
                }}
              >
                <Stack direction='row' gap={1} alignItems='center'>
                  <CreditScore color='secondary' fontSize='small' />
                  <Typography variant='body2'>Thanh toán</Typography>
                </Stack>
              </MenuItem>
              <MenuItem
                disabled={
                  disableCancel(appointmentData.status) || isPast(appointmentData.startDate)
                }
              >
                <Stack direction='row' gap={1} alignItems='center'>
                  <Cancel color='error' fontSize='small' />
                  <Typography variant='body2'>Hủy</Typography>
                </Stack>
              </MenuItem>
            </Stack>
          </Paper>
        </Popper>
        <Tooltip title='Sửa' placement='top'>
          <span>
            <IconButton
              /* eslint-disable-next-line no-alert */
              onClick={() => {
                setOrderId(appointmentData.id)
                setOpenModal(true)
              }}
              size='large'
              disabled={isPast(appointmentData.startDate) || isDone(appointmentData.status)}
            >
              <Edit />
            </IconButton>
          </span>
        </Tooltip>
      </AppointmentTooltip.Header>
    )
  }

  // functions

  const currentDateChange = (dateChange) => setCurrentDate(dateChange)

  const getStatusColor = (statusType) => {
    if (statusType === 'pending') return theme.palette.warning.main
    if (statusType === 'done') return theme.palette.secondary.main
    if (statusType === 'reject') return theme.palette.primary.main
    if (statusType === 'accepted') return theme.palette.info.main
    if (statusType === 'paid') return theme.palette.success.main
    if (statusType === 'doing') return amber[800]
  }

  // async function

  const handleChangeStatus = async (orderId, statusType) => {
    try {
      const detailStatus = statuses.find((status) => status.type === statusType)
      const activityLog = {
        userId: userInfo._id,
        orderId,
        content: `Cập nhật trạng thái thành ${detailStatus.name}`,
      }
      await calendarApi.changeStatus(orderId, statusType)
      await calendarApi.addUpdateActivity(activityLog)
      handleGetListOrder()
    } catch (error) {
      console.log(error)
    }
  }
  const updateOrderStatusToDone = async () => {
    try {
      await calendarApi.updateOrderStatusToDone(orderId)
      handleGetListOrder()
    } catch (error) {
      console.log(error)
    }
  }

  const handleGetListOrder = async () => {
    try {
      const data = await calendarApi.getFutureOrder(userInfo.storeId)
      const appointments = data.map((item) => {
        return {
          id: item._id,
          startDate: new Date(item.startDate),
          endDate: new Date(item.endDate),
          title: item.infoUser.name + ' - ' + item.infoUser.phone,
          status: item.status._id,
          service: item.service._id,
          staff: item.staff,
        }
      })

      dispatch(getFullList(appointments))
    } catch (error) {
      console.log(error)
    }
  }

  const handleGetResources = async () => {
    try {
      const allData = await Promise.all([
        serviceApi.getByStore(userInfo.storeId),
        calendarApi.getListStatus(),
        userApis.getStoreStaff(userInfo.storeId),
      ])
      const serviceData = allData[0]
      const statusData = allData[1]
      const staffData = allData[2]

      const status = statusData.map((item) => ({
        id: item._id,
        text: 'Trạng thái: ' + item.name,
        color: getStatusColor(item.type),
      }))

      const services = serviceData.map((item) => ({
        id: item._id,
        text: `${item.name} - ${formatPrice(item.price)}`,
      }))

      const staff = staffData.map((item) => ({
        id: item._id,
        text: 'Nhân viên: ' + item.name,
      }))

      const serviceResources = {
        fieldName: 'service',
        title: 'Dịch vụ',
        instances: services,
      }

      const statusResources = {
        fieldName: 'status',
        title: 'Trạng thái',
        instances: status,
      }

      const staffResources = {
        fieldName: 'staff',
        title: 'Nhân viên',
        instances: staff,
      }

      setResources([serviceResources, statusResources, staffResources])
      dispatch(setStatus(statusData))
      dispatch(setServices(serviceData))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleGetListOrder()
    handleGetResources()
  }, [])

  useEffect(() => {
    socket.on('connect', () => {
      socket.on('receive-new-order', (data) => {
        if (data === userInfo.storeId) {
          handleGetListOrder()
        }
      })
    })
  }, [socket])

  return (
    <GlassBox sx={{ overflowX: 'auto', padding: { xs: '15px', sm: '30px' } }}>
      <Stack gap={3} width={{ xs: '400px', sm: 'auto' }}>
        <Scheduler data={appointments} locale='vi-VN' height={800}>
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={currentDateChange}
            defaultCurrentViewName='Tháng'
          />
          <DayView startDayHour={8} endDayHour={21} name='Ngày' />
          <WeekView startDayHour={8} endDayHour={21} name='Tuần' />
          <MonthView startDayHour={8} endDayHour={21} name='Tháng' />
          <Toolbar />
          <DateNavigator />
          <TodayButton
            messages={{
              today: 'Hôm nay',
            }}
          />

          <ViewSwitcher />
          <Appointments />
          <AppointmentTooltip headerComponent={Header} showCloseButton />
          <Resources data={resources} mainResourceName='status' />
        </Scheduler>
      </Stack>
      {openDialog && orderId && (
        <DialogConfirm
          openDialog={openDialog}
          closeDialog={() => setOpenDialog(false)}
          next={updateOrderStatusToDone}
          title={dialogTitle}
        />
      )}
      {openModal && orderId && (
        <ModalEditOrder
          openModal={openModal}
          onCloseModal={() => setOpenModal(false)}
          orderId={orderId}
          removeOrderId={() => setOrderId(null)}
          getListOrder={handleGetListOrder}
          onOpenAlert={() => setOpenAlert(true)}
          setAlertInfo={setAlertInfo}
        />
      )}
      {openModalPay && orderId && (
        <ModalPay
          openModal={openModalPay}
          onCloseModal={() => setOpenModalPay(false)}
          orderId={orderId}
          getListOrder={handleGetListOrder}
          onOpenAlert={() => setOpenAlert(true)}
          setAlertInfo={setAlertInfo}
        />
      )}
      {openAlert && (
        <AlertCustom
          open={openAlert}
          onClose={() => setOpenAlert(true)}
          message={alertInfo.message}
          status={alertInfo.type}
          time={2000}
        />
      )}
    </GlassBox>
  )
}

const CustomPaper = styled(Paper)`
  padding: 15px;
  z-index: 60;
`

export default Calendar

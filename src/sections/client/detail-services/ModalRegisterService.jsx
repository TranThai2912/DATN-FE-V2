import { yupResolver } from '@hookform/resolvers/yup'
import { AccessTime, CheckCircle, Close, FileDownloadDone, Person } from '@mui/icons-material'
import {
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Modal,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  styled,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import GlassBox from '../../../components/GlassBox'
import MainButton from '../../../components/MainButton'
import RHFDatePicker from '../../../components/ReactHookForm/RHFDatePicker'
import RHFProvider from '../../../components/ReactHookForm/RHFProvider'
import RHFTextField from '../../../components/ReactHookForm/RHFTextField'
import dateFormat from '../../../utils/dateFormat'
import phoneRegExp from '../../../utils/phoneRegExp'
const registerStep = [
  {
    key: 1,
    title: 'Thông tin người dùng',
  },
  {
    key: 2,
    title: 'Chọn khung giờ',
  },
  {
    key: 3,
    title: 'Hoàn thành',
  },
]

const listTimeRange = [
  {
    key: 1,
    label: '08:00 - 09:00',
  },
  {
    key: 2,
    label: '08:00 - 09:00',
  },
  {
    key: 3,
    label: '08:00 - 09:00',
  },
  {
    key: 4,
    label: '08:00 - 09:00',
  },
  {
    key: 5,
    label: '08:00 - 09:00',
  },
  {
    key: 6,
    label: '08:00 - 09:00',
  },
  {
    key: 7,
    label: '08:00 - 09:00',
  },
  {
    key: 8,
    label: '08:00 - 09:00',
  },
  {
    key: 9,
    label: '08:00 - 09:00',
  },
]

const ModalRegisterService = ({ onCloseModal, openModal }) => {
  const [activeStep, setActiveStep] = useState(1)
  const [checkedIndex, setCheckedIndex] = useState(-1)
  const [timeRange, setTimeRange] = useState()
  const [formValues, setFormValues] = useState()

  // form schema
  const formSchema = yup.object().shape({
    name: yup.string().trim().required('Vui lòng nhập họ tên'),
    phone: yup
      .string()
      .trim()
      .required('Vui lòng nhập số điện thoại')
      .matches(phoneRegExp, 'Không đúng định dạng số điện thoại'),
    date: yup.date().required('Vui lòng chọn ngày'),
  })

  // react hook form
  const methods = useForm({
    defaultValues: {
      name: '',
      phone: '',
      date: new Date(),
    },
    resolver: yupResolver(formSchema),
  })

  const { handleSubmit, reset } = methods

  // function

  const isChecked = (index) => {
    return index === checkedIndex
  }

  const onSubmit = (values) => {
    setFormValues(values)
    setActiveStep(activeStep + 1)
  }

  return (
    <Modal open={openModal} onClose={onCloseModal}>
      <Container
        maxWidth='lg'
        sx={{ display: 'flex', alignItems: 'center', height: '100vh', justifyContent: 'center' }}
      >
        <GlassBox sx={{ width: '100%', padding: { xs: '15px', sm: '30px' } }} opacity={1}>
          <Stack gap={4}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='h2'>Đăng ký dịch vụ</Typography>
              <IconButton onClick={onCloseModal}>
                <Close />
              </IconButton>
            </Stack>
            <Box sx={{ width: '100%' }}>
              <Stepper activeStep={activeStep} alternativeLabel connector={<QontoConnector />}>
                {registerStep.map((step, index) => {
                  return (
                    <Step key={step.key}>
                      <StepLabel StepIconComponent={QontoStepIcon}>
                        <Typography
                          variant='subtitle1'
                          sx={{ color: (theme) => theme.palette.text.secondary }}
                        >
                          {step.title}
                        </Typography>
                      </StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
              <Box sx={{ mt: '30px' }}>
                {activeStep === 1 && (
                  <RHFProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={1}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <RHFTextField name='name' fullWidth label='Họ tên' />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <RHFTextField name='phone' fullWidth label='Số điện thoại' />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <RHFDatePicker name='date' label='Chọn ngày' disablePast />
                        </Grid>
                      </Grid>
                      <FormControlLabel
                        value={false}
                        control={<Checkbox />}
                        label='Đăng ký cho người khác'
                      />
                      <MainButton
                        sx={{ alignSelf: 'center', padding: '15px 85px', mt: 10 }}
                        colorType='primary'
                        type='submit'
                      >
                        Tiếp theo
                      </MainButton>
                    </Stack>
                  </RHFProvider>
                )}
                {activeStep === 2 && (
                  <Stack gap={4}>
                    <Grid container spacing={1} rowSpacing={2}>
                      {timeRange?.error && (
                        <Grid item xs={12}>
                          <Typography variant='h3' color='primary' textAlign='center'>
                            Vui lòng chọn khung giờ
                          </Typography>
                        </Grid>
                      )}
                      {listTimeRange.map((time, index) => (
                        <Grid key={time.key} item xs={6} sm={3} md={2}>
                          <input
                            hidden
                            type='radio'
                            name='time'
                            id={`time-range-${index}`}
                            value={index}
                            onChange={() => {
                              setCheckedIndex(index)
                              setTimeRange({ error: false, value: time.label })
                            }}
                          />
                          <MainButton
                            sx={{
                              border: isChecked(index) ? 'none' : '1px solid #e3e3e3',
                              padding: '10px',
                            }}
                            colorType={isChecked(index) ? 'primary' : 'neutral'}
                            component='label'
                            htmlFor={`time-range-${index}`}
                          >
                            <Typography variant='body1'>{time.label}</Typography>
                          </MainButton>
                        </Grid>
                      ))}
                    </Grid>
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                      sx={{ mt: { xs: 3, sm: 10 } }}
                    >
                      <MainButton
                        sx={{ border: '1px solid #e3e3e3', px: { xs: '25px', sm: '50px' } }}
                        colorType='neutral'
                        onClick={() => setActiveStep(activeStep - 1)}
                      >
                        Quay lại
                      </MainButton>
                      <MainButton
                        sx={{ px: { xs: '25px', sm: '50px' } }}
                        colorType='primary'
                        onClick={() => {
                          if (!timeRange?.value) return setTimeRange({ error: true, value: null })
                          setActiveStep(activeStep + 1)
                        }}
                      >
                        Tiếp theo
                      </MainButton>
                    </Stack>
                  </Stack>
                )}
                {activeStep === 3 && (
                  <Stack gap={2} alignItems='center'>
                    <Stack direction='row' alignItems='center' gap={1}>
                      <CheckCircle color='secondary' />
                      <Typography variant='h3' color='secondary'>
                        Đăng ký thành công
                      </Typography>
                    </Stack>
                    <Stack sx={{ width: { xs: '100%', sm: '500px' } }}>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body1'>Họ tên:</Typography>
                        <Typography variant='body1'>{formValues.name}</Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body1'>Số điện thoại:</Typography>
                        <Typography variant='body1'>{formValues.phone}</Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body1'>Dịch vụ đăng ký: </Typography>
                        <Typography variant='body1'>Massage chân</Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body1'>Ngày làm dịch vụ: </Typography>
                        <Typography variant='body1'>{dateFormat(formValues.date)}</Typography>
                      </Stack>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Typography variant='body1'>Giờ làm: </Typography>
                        <Typography variant='body1'>{timeRange.value}</Typography>
                      </Stack>
                    </Stack>
                    <MainButton
                      sx={{ padding: '15px 85px', mt: 3 }}
                      colorType='primary'
                      onClick={onCloseModal}
                    >
                      Hoàn thành
                    </MainButton>
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        </GlassBox>
      </Container>
    </Modal>
  )
}

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 35px)',
    right: 'calc(50% + 35px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eeeeee',
    borderTopWidth: 3,
    borderRadius: 1,
    transition: '0.3s',
  },
}))

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  '& .QontoStepIcon-completedIcon': {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
  '& .QontoStepIcon-circle': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
}))

const IconCircle = styled(Box)(
  ({ theme }) => `
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #eeeeee;
    display: flex;
    justify-content: center;
    align-items: center;
    .MuiSvgIcon-root {
        font-size: 30px;
        color: #979797;
    }

    &.active {
        background: ${theme.palette.primary.main};
        .MuiSvgIcon-root {
            color: white;
        }
    }

    @media screen and (max-width: 767px) {
        width: 35px;
        height: 35px;
        .MuiSvgIcon-root {
            font-size: 20px;
        }
    }
`,
)

function QontoStepIcon({ active, completed, className, icon }) {
  const icons = {
    1: <Person />,
    2: <AccessTime />,
    3: <FileDownloadDone />,
  }
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <IconCircle className='active'>{icons[String(icon)]}</IconCircle>
      ) : (
        <IconCircle>{icons[String(icon)]}</IconCircle>
      )}
    </QontoStepIconRoot>
  )
}

export default ModalRegisterService

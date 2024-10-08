'use client'
import React, { useEffect, useState } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import type { ToolbarProps, ToolbarSlot, TransformToolbarSlot } from '@react-pdf-viewer/toolbar';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import useAxiosAuth from '@/app/utils/hooks/useAxiosAuth';
import { Breadcrumb, Button, Modal, Result, Select, Spin, Table, Tag, UploadFile } from 'antd';
import { errorNotify, sucessNotify } from '@/app/utils/toast';
import { ICustomerContract } from '@/app/models/CustomerContract';
import ExpandRowCollateral from '../components/ExpandRowCollateral';
import ExpandRowRecievingCar from '../components/ExpandRowRecievingCar';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/app/utils/formatCurrency';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import { useRouter, useSearchParams } from 'next/navigation';
import { ICar } from '@/app/models/Car.model';
import { TableProps } from 'antd/lib';
import { ICarModel } from '@/app/models/CarModel.model';
import MultipleSelect from './components/MultipleSelect';
import ReplaceCarDropdown from './components/ReplaceCarDropdown';
import Dialog from '@/app/components/Modal';
import CarDialog from '../../cars/components/CarDialog';
import AccountDialog from '../../accounts/components/AccountDialog';
import { IAccount } from '@/app/models/Account.model';
import './style.css'
import Ribbon from './components/Ribbon';
import Link from 'next/link';
import { IPayment } from '@/app/models/Payment.model';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
type Option = {
    label: string,
    valeu: string
}
export default function ContractPage({
    params: { customerIdSlug }
}: {
    params: { customerIdSlug: any }
}) {
    const searchParams = useSearchParams()?.get('fromNoti')

    const [pdfUrl, setPdfUrl] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<any>(false)
    const [fileCarCondition, setFileCarCondition] = useState<UploadFile[]>([])
    const [customerContractDetail, setCustomerContractDetail] = useState<ICustomerContract>()
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [openContractPdf, setOpenContractPdf] = useState<boolean>(false)
    const [openReplaceCarList, setOpenReplaceCarList] = useState<boolean>(false)
    const [loadingReplaceCarList, setLoadingReplaceCarList] = useState<boolean>(true)
    const [replaceCarList, setReplaceCarList] = useState<ICar[]>()
    const [open, setOpen] = useState<boolean>(false)
    const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
        ...slot,
        Open: () => <></>,
        DownloadMenuItem: () => <></>,
        EnterFullScreen: () => <></>,
        EnterFullScreenMenuItem: () => <></>,
        SwitchTheme: () => <></>,
        SwitchThemeMenuItem: () => <></>,
        GoToNextPage: () => <></>,
        NumberOfPages: () => <></>,
        CurrentPageInput: () => <></>
    });
    const axiosAuth = useAxiosAuth()
    const [refresh, setRefresh] = useState<boolean>(true)
    const { t } = useTranslation()
    const [loadingDialog, setLoadingDialog] = useState<boolean>(true);
    const [carDetail, setCarDetail] = useState<ICar>()
    const [openAccountDialog, setOpenAccountDialog] = useState<boolean>(false)
    const [loadingAccountDialog, setLoadingAccountDialog] = useState<boolean>(false)
    const [accountDetail, setAccountDetail] = useState<IAccount>()
    const [paramReplaceCar, setParamReplaceCar] = useState<any>(
        {
            start_date: '',
            end_date: '',
            fuels: '',
            parking_lots: '',
            motions: '',
            number_of_seats: ''
        }
    )
    const renderToolbar = (Toolbar: (props: ToolbarProps) => React.ReactElement) => (
        <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
    );
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
    });
    const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;
    const [noteValue, setNoteValue] = useState<any>('')

    const column: TableProps<ICar>['columns'] = [
        {
            title: 'Hãng xe',
            dataIndex: 'car_model',
            key: 'id',
            render: (model: any) => <>{model.brand}</>
        },
        {
            title: 'Mẫu xe',
            dataIndex: 'car_model',
            key: 'id',
            render: (model: ICarModel) => <>{model.model}</>
        },
        {
            title: 'Biển số xe',
            dataIndex: 'license_plate',
            key: 'id',
        },
        {
            title: 'Giá cho thuê',
            dataIndex: 'price',
            key: 'id',
            render: (price: Number) => <>{formatCurrency(price)}</>
        },
        {
            title: 'Nơi đậu xe',
            dataIndex: 'parking_lot',
            key: 'id',
            render: (parking) => t(`common:${parking}`)
        },
        {
            title: 'Số chỗ',
            dataIndex: 'car_model',
            key: 'id',
            render: (car_model: ICarModel) => car_model.number_of_seats
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'id',
            render: (_, record) => <ReplaceCarDropdown
                setOpenContractPdf={setOpenContractPdf}
                changeCarForCustomer={() => changeCarForCustomer(record.id, customerIdSlug)}
                handleOpenAccountDetailDialog={() => handleOpenAccountDetailDialog(record.partner_id)}
                handleOpenDetailDialog={() => handleOpenDetailDialog(record.id)} />
        }
    ]

    const handleChangeNote = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log(e.target.value);
        setNoteValue(e.target.value)
    };

    const changeCarForCustomer = async (carId: any, customerContractId: any) => {
        const { confirm } = Modal
        confirm({
            title: 'Bạn có muốn thay bằng xe này?',
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setOpenContractPdf(false)
                    const response = await axiosAuth.post('/technician/customer_contract/change_car', {
                        customer_contract_id: parseInt(customerContractId),
                        new_car_id: parseInt(carId)
                    })
                    console.log('response change: ', response.data.data);
                    setReplaceCarList([])
                    setOpenReplaceCarList(false)
                    setRefresh(prev => !prev)
                } catch (error) {

                }
            },
            onCancel: () => {

            }
        })

    }
    const handleOpenReplaceCarList = async () => {
        setOpenReplaceCarList(true)
        setLoadingReplaceCarList(true)
        try {
            const response = await axiosAuth.get(
                `/technician/find_change_cars`, {
                params: {
                    start_date: customerContractDetail?.start_date,
                    end_date: customerContractDetail?.end_date,
                    fuels: paramReplaceCar.fuels && paramReplaceCar.fuels.join(','),
                    motions: paramReplaceCar.motions && paramReplaceCar.motions.join(','),
                    number_of_seats: paramReplaceCar.number_of_seats && paramReplaceCar.number_of_seats.join(','),
                    parking_lots: paramReplaceCar.parking_lots && paramReplaceCar.parking_lots.join(',')
                }
            }
            )

            setReplaceCarList(response.data.data)
            setLoadingReplaceCarList(false)
        } catch (error: any) {
            if (error.response.data.error_code === 10049) {
                errorNotify("Ngày bắt đầu phải sau thời gian hiện tại")
                setOpenReplaceCarList(true)
                setLoadingReplaceCarList(false)
            }
        }
    }
    const handleViewContract = async (id: any) => {

        if (!openContractPdf) {
            try {
                const response = await axiosAuth.get(
                    '/technician/contract/' + id
                )
                setPdfUrl(response.data.data.url)

            } catch (error) {
                setOpenContractPdf(prev => !prev)
            }
        }
        setOpenContractPdf(prev => !prev)
    }
    const handleOpenAccountDetailDialog = async (id: any) => {
        try {
            setOpenAccountDialog(true)
            setLoadingAccountDialog(true)
            const response = await axiosAuth.get('/technician/account/' + id)
            setAccountDetail(response.data.data)
            setLoadingAccountDialog(false)
        } catch (error) {
            console.log(error);

        }
    }
    const handleOpenDetailDialog = async (id: any) => {
        try {
            setOpen(true);
            setLoadingDialog(true);
            const carDetail = await axiosAuth.get(`/car/${id}`)
            const detail: ICar = carDetail.data.data
            setCarDetail(detail)
            setLoadingDialog(false)
        } catch (error) {
            console.log(error);

        }

    };

    const getContractDetailById = async (id: any) => {
        setLoading(true)
        try {
            const response = await axiosAuth.get(
                '/technician/contract/' + id
            )
            setCustomerContractDetail(response.data.data)

            setFileList(
                response.data
                    .data.collateral_asset_images.map((img: any) =>
                    ({
                        url: img.url,
                        status: 'done',
                        uid: img.id,
                        isUpload: true
                    })))

            setFileCarCondition(
                response.data
                    .data.receiving_car_images.map((img: any) =>
                    ({
                        url: img.url,
                        status: 'done',
                        uid: img.id,
                        isUpload: true
                    })))
            setLoading(false)
        } catch (error) {
            console.log(error);
            setLoading(false)
            setError(true)
        }

    }

    const handleAppraisingReturnedCar = async (id: any) => {
        // /technician/customer_contract/appraising_returned_car
        const { confirm } = Modal
        try {
            confirm({
                title: "Bạn có muốn xác nhận hoàn thành kiểm tra?",
                cancelText: "Hủy",
                onOk: async () => {
                    const response = await axiosAuth.put('/technician/customer_contract/appraising_returned_car', {
                        customer_contract_id: id,
                        note: noteValue
                    })
                    if (response.status === 200) {
                        sucessNotify('Đã xác nhận thành công')
                        setRefresh(prev => !prev)
                    }
                }
            })
        } catch (error) {
            errorNotify("Đã có lỗi, vui lòng thử lại")
        }
    }

    const approveCustomerContract = async (id: any) => {
        const { confirm, error } = Modal
        try {
            const contractResponse = await axiosAuth.get("/technician/contract/" + id)
            console.log('res: ', contractResponse.data.data);

            const contractDetail: ICustomerContract = contractResponse.data.data
            if (contractDetail.receiving_car_images.length < 1
            ) {
                errorNotify("Vui lòng thêm ảnh trước khi bàn giao")
                return
            }
        } catch (error) {

        }

        confirm({
            title: 'Bạn có muốn duyệt?',
            onOk: async () => {
                try {
                    const response = await axiosAuth.put('/technician/customer_contract/appraising_car', {
                        customer_contract_id: id,
                        action: "approve"
                    })

                    if (response.status === 200) {
                        setRefresh(prev => !prev)
                        sucessNotify('Đã duyệt thành công')
                    }
                } catch (e: any) {
                    console.log(e);
                    if (e.response.data.error_code == 10032) {
                        error({
                            title: 'Chiếc xe này đã dừng hoạt động, vui lòng thay xe hoặc hoàn trả thế chấp',
                        })
                    }
                }
            },
            onCancel: () => {

            }
        })

    }
    const rejectCustomerContract = (id: any) => {
        const { confirm } = Modal
        confirm({
            title: "Bạn có muốn từ chối hợp đồng này?",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const response = await axiosAuth.put("/technician/customer_contract/appraising_car", {
                        customer_contract_id: id,
                        action: "reject"
                    })
                    if (response.status === 200) {
                        sucessNotify("Đã từ chối thành công")
                        setRefresh(prev => !prev)
                    }
                } catch (error) {
                    errorNotify("Đã có lỗi, vui lòng thử lại")
                }


            }
        })
    }
    useEffect(() => {
        getContractDetailById(customerIdSlug)
    }, [customerIdSlug, refresh])
    return (
        <>
            {
                loading &&
                <Spin size='large' style={{ position: 'absolute', left: '50%', top: '50%', transform: "translate(-50%,-50%)" }} />
            }
            {
                !loading &&
                <>
                    <Dialog
                        width='50%'
                        loading={loadingDialog}
                        open={open}
                        setOpen={setOpen}
                        title='Thông tin xe'
                        isIntercept={false}
                    >
                        <CarDialog
                            detail={carDetail}
                        />
                    </Dialog>
                    <Dialog
                        width='45%'
                        loading={loadingAccountDialog}
                        setOpen={setOpenAccountDialog}
                        title="Chi tiết tài khoản"
                        open={openAccountDialog}
                        isIntercept={false}
                    >
                        <AccountDialog
                            detail={accountDetail}
                        />
                    </Dialog>
                    {
                        !error &&
                        <>
                            <Breadcrumb
                                style={{
                                    marginTop: 10
                                }}
                                items={[
                                    {
                                        title: <Link
                                            style={{ color: "blue" }}
                                            href={`/`}>Danh sách xe cần kiểm tra</Link>,
                                    },
                                    {
                                        title: <p style={{
                                            color: "#767da9",
                                            fontWeight: "500",
                                            textDecoration: "underline"
                                        }}>
                                            {
                                                customerContractDetail?.car.car_model.brand
                                                + ' '
                                                + customerContractDetail?.car.car_model.model
                                                + ' '
                                                + customerContractDetail?.car.car_model.year
                                            }
                                        </p>,
                                    },
                                ]}
                            />
                            <div className='shadow-sm relative' style={{
                                background: '#fff',
                                padding: 10,
                                margin: 10,
                                borderRadius: 15
                            }}>
                                <div className='flex justify-between cardRibbon'>
                                    <div className='mt-10'>
                                        <p className='text-lg font-semibold mt-4 mb-4'>Thông tin hợp đồng của khách hàng
                                            <span>{
                                                ' '
                                                + customerContractDetail?.customer.last_name
                                                + ' '
                                                + customerContractDetail?.customer.first_name
                                            }
                                            </span>
                                            <Ribbon status={customerContractDetail?.status} content={t(`common:${customerContractDetail?.status}`)} />
                                        </p>
                                        <p

                                            className='font-medium mt-4'

                                        >Loại xe:   <span
                                            onClick={() => handleOpenDetailDialog(customerContractDetail?.car.id)}
                                            style={{
                                                color: 'blue',
                                                cursor: 'pointer'
                                            }}>{
                                                    ' '
                                                    + customerContractDetail?.car.car_model.brand
                                                    + ' '
                                                    + customerContractDetail?.car.car_model.model
                                                    + ' '
                                                    + customerContractDetail?.car.car_model.year
                                                }</span>
                                        </p>
                                        <p className='font-medium mt-3'>Loại thế chấp:   {
                                            ' '
                                            + t(`common:${customerContractDetail?.collateral_type}`)
                                        }</p>
                                        <p className='font-medium mt-3'>Ngày nhận xe:   {
                                            customerContractDetail?.start_date && dayjs(customerContractDetail.start_date).format('DD-MM-YYYY HH:mm:ss')
                                        }
                                        </p>
                                        <p className='font-medium mt-3'>Ngày trả xe:   {
                                            customerContractDetail?.end_date && dayjs(customerContractDetail.end_date).format('DD-MM-YYYY HH:mm:ss')
                                        }
                                        </p>
                                        {/* {
                                            customerContractDetail?.collateral_type === 'cash' &&
                                            (customerContractDetail.status === 'completed' || customerContractDetail?.status === 'renting')
                                            &&
                                            <p className='font-medium mt-3'>Số tiền đã thế chấp:   {
                                                ' '
                                                + formatCurrency(customerContractDetail.collateral_cash_amount)
                                            }</p>
                                        } */}
                                    </div>
                                    {
                                        !searchParams &&
                                        <div className='flex flex-col items-baseline'>
                                            {
                                                customerContractDetail?.status === 'returned_car' && <div className='flex justify-between w-full'>
                                                    <button
                                                        style={{
                                                            color: '#fff',
                                                            padding: '7px 20px',
                                                            outline: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => handleAppraisingReturnedCar(parseInt(customerIdSlug))}
                                                        className="inline-flex 
                                        animate-shimmer 
                                        items-center 
                                        justify-center 
                                        rounded-md border 
                                        border-slate-800 bg-[linear-gradient(110deg,#33bf4e,45%,#60ff7e,55%,#33bf4e)]
                                        bg-[length:200%_100%] 
                                        font-medium 
                                        text-slate-400 
                                        transition-colors 
                                        focus:outline-none 
                                        focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                                                    >
                                                        Xác nhận hoàn thành kiểm tra
                                                        <CheckOutlinedIcon sx={{ color: '#fff', fontSize: 16, marginLeft: 2 }} />
                                                    </button>
                                                </div>
                                            }
                                            {customerContractDetail?.status === 'ordered' &&
                                                <div className='flex justify-between w-full'>
                                                    <button
                                                        style={{
                                                            color: '#fff',
                                                            padding: '7px 20px',
                                                            outline: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: 'red',
                                                            marginRight: '20px'
                                                        }}
                                                        onClick={() => rejectCustomerContract(parseInt(customerIdSlug))}
                                                        className="inline-flex 
                                                animate-shimmer 
                                                items-center 
                                                justify-center 
                                                rounded-md border 
                                                bg-[length:200%_100%] 
                                                font-medium 
                                                text-slate-400 
                                                transition-colors 
                                                focus:outline-none 
                                                focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                                                    >
                                                        Từ chối
                                                        <CloseRoundedIcon sx={{ color: '#fff', fontSize: 16, marginLeft: 2 }} />
                                                    </button>

                                                    <button
                                                        style={{
                                                            color: '#fff',
                                                            padding: '7px 20px',
                                                            outline: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => approveCustomerContract(parseInt(customerIdSlug))}
                                                        className="inline-flex 
                                                animate-shimmer 
                                                items-center 
                                                justify-center 
                                                rounded-md border 
                                                border-slate-800 bg-[linear-gradient(110deg,#33bf4e,45%,#60ff7e,55%,#33bf4e)]
                                                bg-[length:200%_100%] 
                                                font-medium 
                                                text-slate-400 
                                                transition-colors 
                                                focus:outline-none 
                                                focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
                                                    >
                                                        Duyệt
                                                        <CheckOutlinedIcon sx={{ color: '#fff', fontSize: 16, marginLeft: 2 }} />
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                                {/* {
                                    customerContractDetail?.collateral_type !== 'cash'
                                    &&
                                    <div className='mt-4'> <ExpandRowCollateral
                                        getDataForExpand={getContractDetailById}
                                        id={customerIdSlug}
                                        expandLoading={loading}
                                        fileList={fileList}
                                        status={customerContractDetail?.status}
                                        setFileList={setFileList}
                                    /></div>
                                } */}
                                {
                                    !searchParams &&
                                    <div className='mt-4 mb-7'>
                                        <ExpandRowRecievingCar
                                            id={customerIdSlug}
                                            fileList={fileCarCondition}
                                            status={customerContractDetail?.status}
                                            expandLoading={loading}
                                            setFileCarCondition={setFileCarCondition}
                                            getDataForExpand={getContractDetailById}
                                        />
                                    </div>
                                }

                                {/* {
                                    !searchParams && customerContractDetail?.status === 'ordered' &&
                                    <><h1
                                        style={{
                                            fontWeight: 600,
                                            marginBottom: 10,
                                            color: "#9250fa"
                                        }}
                                    >
                                        Tìm xe mới để thay thế
                                    </h1>
                                        <div style={{
                                            background: '#fff',
                                            padding: 10,
                                            border: '1px solid #efefef'
                                        }}>

                                            <div className='grid grid-cols-2 gap-5'>
                                                <MultipleSelect
                                                    handleChange={handleChangeFuels}
                                                    placeholder={'Chọn nhiêu liệu'}
                                                    options={fuelOptions}
                                                />
                                                <MultipleSelect
                                                    handleChange={handleChangeMotions}
                                                    placeholder={'Chọn động cơ'}
                                                    options={motionOptions}
                                                />
                                                <MultipleSelect
                                                    handleChange={handleChangeSeats}
                                                    placeholder={'Chọn số chỗ ngồi'}
                                                    options={[
                                                        {
                                                            label: "4 chỗ",
                                                            value: 4
                                                        },
                                                        {
                                                            label: '7 chỗ',
                                                            value: 7
                                                        },
                                                        {
                                                            label: '15 chỗ',
                                                            value: 15
                                                        }
                                                    ]}
                                                />
                                                <MultipleSelect
                                                    handleChange={handleChangeParkingLots}
                                                    placeholder={'Chọn chỗ để xe'}
                                                    options={parkingLotOptions}
                                                />
                                            </div>
                                            {
                                                customerContractDetail?.status === 'ordered' &&
                                                <>
                                                    <Button
                                                        style={{ width: '200px' }}
                                                        className='mb-5 mt-5'
                                                        onClick={handleOpenReplaceCarList}>
                                                        Tìm xe
                                                    </Button>
                                                </>

                                            }
                                            {
                                                !error && openReplaceCarList &&
                                                <Table
                                                    dataSource={replaceCarList}
                                                    loading={loadingReplaceCarList}
                                                    columns={column}
                                                />
                                            }
                                        </div>
                                    </>
                                } */}
                                {
                                    customerContractDetail?.status === 'returned_car' && <div>
                                        <h2
                                            style={{ color: "#9250fa" }}
                                            className='text-base mt-3 mb-3 font-semibold '>
                                            Ghi chú sau khi kiểm tra xe
                                        </h2>
                                        <TextArea placeholder="Vui lòng thêm ghi chú nếu có" value={noteValue} allowClear onChange={handleChangeNote} />
                                    </div>
                                }
                                <Button
                                    type='primary'
                                    style={{ width: '200px' }}
                                    className='mb-5 mt-10'
                                    onClick={() => handleViewContract(customerIdSlug)}>
                                    {!openContractPdf ? 'Xem hợp đồng' : 'Đóng'}
                                </Button>
                                {
                                    openContractPdf &&
                                    <div style={{
                                        minHeight: '500px'
                                    }}>
                                        <Worker
                                            workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                                            <Viewer
                                                fileUrl={pdfUrl}
                                                plugins={[defaultLayoutPluginInstance]}
                                            />
                                        </Worker>
                                    </div>
                                }
                            </div>
                        </>
                    }
                    {
                        error &&
                        <Result
                            status='error'
                            title={error}
                            subTitle="Xin lỗi, không tìm thấy hợp đồng nào"
                        />
                    }


                </>
            }
        </>
    )
}

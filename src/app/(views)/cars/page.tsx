'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import '../../globals.css'
import TopFilterTable from '@/app/components/TopFilterTable'
import useAxiosAuth from '@/app/utils/hooks/useAxiosAuth'
import { ICar } from '@/app/models/Car.model'
import { TableParams } from '@/app/models/TableParams.model'
import CarTable from './components/CarTable'
import { usePathname } from 'next/navigation'

export default function Cars() {
    const axiosAuth = useAxiosAuth()
    const [filter, setFilter] = useState('waiting_car_delivery')
    const [carData, setCarData] = useState<ICar[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [refresh, setRefresh] = useState<boolean>(true)
    const [loadingCurrentSeats, setLoadingCurrentSeats] = useState<boolean>(true)
    const [searchValue, setSearchValue] = useState<string>()
    const path = usePathname()
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const getCarList = async (filter: any) => {
        setCarData([])
        try {
            setLoading(true)
            const carList = await axiosAuth.get(
                `/technician/cars?car_status=${filter}`
            )
            setCarData(carList.data.data.cars)
            setLoading(false)
        } catch (error) {
            console.log(error);

            setLoading(false)
        }

    }
    useEffect(() => {
        if (path === '/cars') {
            setRefresh(prev => !prev)
        }
    }, [path])
    useEffect(() => {
        if (!searchValue) {
            getCarList(filter)
            return
        }
        const getData = setTimeout(async () => {
            setLoading(true)
            const query = `technician/cars?car_status=${filter}&search_param=${searchValue}&offset=0&limit=100`
            const getCarsBySearch = await axiosAuth.get(query)
            setCarData(getCarsBySearch.data.data.cars)
            setLoading(false)
        }, 1000)
        return () => clearTimeout(getData)
    }, [filter, refresh, searchValue])


    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const handleChange = (e: string) => {
        setFilter(e)
        setSearchValue('')
    }
    return (
        <div>
            <TopFilterTable
                searchValue={searchValue}
                setRefresh={setRefresh}
                showSearch={true}
                placeholder='Tìm kiếm theo họ và tên/email/số điện thoại'
                defaultValue='waiting_car_delivery'
                handleChange={handleChange}
                optionList={[
                    { label: 'Xe đang chờ giao', value: 'waiting_car_delivery' },
                    { label: 'Xe đang hoạt động', value: 'active' },
                    { label: 'Xe bị từ chối', value: 'rejected' },
                    { label: 'Xe dừng hoạt động', value: 'inactive' },
                ]}
                handleSearch={handleSearch}
                showGarageConfig={false}
            />
            <CarTable
                loading={loading}
                carData={carData}
                filter={filter}
                setRefresh={setRefresh}
            />

        </div>
    )
}

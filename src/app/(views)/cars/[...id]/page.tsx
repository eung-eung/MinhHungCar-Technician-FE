'use client'
import { ICar } from '@/app/models/Car.model';
import useAxiosAuth from '@/app/utils/hooks/useAxiosAuth';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import CarouselImages from '../components/Carousel';
import classes from './index.module.css'
import CarInformation from '../components/CarInformation';
import { Spin } from 'antd';
import CountQuantityInput from '../components/CountQuantityInput';
export default function CarDetail({
    params: { id }
}: {
    params: { id: any, }
}) {
    const [loading, setLoading] = useState<boolean>(true)
    const axiosAuth = useAxiosAuth()
    const [notFound, setNotFound] = useState<boolean>(true)
    const [detail, setDetail] = useState<ICar>()
    const [refresh, setRefresh] = useState<boolean>(false)
    const getCarDetail = async () => {
        try {
            setLoading(true)
            const response = await axiosAuth.get('/car/' + id[0])
            console.log(response.data.data);
            setNotFound(false)
            setDetail(response.data.data)
            setLoading(false)
        } catch (error) {
            console.log('error:', error);
            setNotFound(true)
            setLoading(false)
        }

    }

    useEffect(() => {
        if ((id.length === 1) || (id.length < 3 && id[1] === 'nooverlay')) {
            getCarDetail()
        } else {
            setNotFound(true)
            setLoading(false)
        }
    }, [id, refresh])
    return (
        <div className='relative'>
            {loading && <div
                className='flex items-center justify-center' style={{ height: '80vh' }}>
                <Spin /></div>
            }
            {notFound && !loading && <div>404</div>}
            {
                !notFound && <div className={classes.detail + ' row-span-1 rounded-xl h-max  group/bento transition duration-200 shadow-input dark:shadow-none p-4 pb-5 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent space-y-4'}>
                    <div className={classes.leftDetail}>
                        <CarouselImages images={detail?.images} />
                    </div>
                    <div className={classes.rightDetail}>

                        <CarInformation
                            showAction={true}
                            detail={detail} setRefresh={setRefresh} />

                    </div>
                </div>
            }
        </div>
    )
}

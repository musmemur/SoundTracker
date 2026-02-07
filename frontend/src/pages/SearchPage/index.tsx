import styles from './index.module.scss';
import {useLocation, useNavigate} from "react-router";
import {lazy, Suspense, useCallback, useEffect, useState} from "react";
import {axiosInstance} from "../../app/axiosInstance.ts";
import HeaderSkeleton from "../../shared/ui/Skeletons/HeaderSkeleton";
import ReleasesSectionSkeleton from "../../shared/ui/Skeletons/ReleasesSectionSkeleton";
import Skeleton from "react-loading-skeleton";
import {Release} from "../../entities/Release.ts";
import {ReleaseWithRating} from "../../entities/ReleaseWithRating.ts";
import {SavedRelease} from "../../entities/SavedRelease.ts";

const Header = lazy(() => import("../../widgets/Header"));
const ReleasesSection = lazy(() => import("../../widgets/ReleasesSection"));

export const SearchPage = () => {
    const navigate = useNavigate();
    const [albums, setAlbums] = useState<Release[] | ReleaseWithRating[] | SavedRelease[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [page, setPage] = useState<number>(1);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchValue = searchParams.get("search");

    const scrollHandler = (e) => {
        if (e.target.documentElement.scrollHeight - (e.target.documentElement.scrollTop + window.innerHeight) < 500) {
            console.log('scroll');
            setIsMoreLoading(true);
        }
    }

    const fetchData = useCallback(async (page: number) => {
        if (!searchValue || searchValue === "") {
            navigate('/');
            return
        }

        try {
            const queryString = encodeURIComponent(searchValue);
            const response = await axiosInstance.get(
                `/Search?query=${queryString}&page=${page}`
            );

            const newAlbums = response.data.albums || [];

            setAlbums(prev => {
                const existingIds = new Set(prev.map(album => album.url || album.name));
                const uniqueNewAlbums = newAlbums.filter(album =>
                    !existingIds.has(album.url || album.name) && album.image?.[0]?.['#text']
                );
                return [...prev, ...uniqueNewAlbums];
            });
            setPage(prev => prev+1);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
            setIsMoreLoading(false);
        }
    }, [navigate, searchValue]);

    useEffect(() => {
        if (!searchValue) return;
        setAlbums([]);
        setPage(1);
        setIsLoading(true);

        fetchData(page);

        document.addEventListener('scroll', scrollHandler);

        return function ()  {
            document.removeEventListener('scroll', scrollHandler);
        }
    }, [searchValue]);

    useEffect(() => {
        if (isMoreLoading) {
            //setPage(page)
            fetchData(page);
        }
    }, [fetchData, isMoreLoading, page]);

    if (isLoading) {
        return (
            <>
                <HeaderSkeleton/>
                <Skeleton width={500} height={20} style={{marginLeft: '2rem', marginTop: '1rem'}} />
                <ReleasesSectionSkeleton/>
            </>
        );
    }

    return(
        <>
            <Suspense fallback={
                <>
                    <HeaderSkeleton/>
                    <Skeleton width={500} height={20} style={{marginLeft: '2rem', marginTop: '1rem'}} />
                    <ReleasesSectionSkeleton/>
                </>
            }>
                <Header/>
                <div className={styles.searchResult}>
                    Результаты по запросу <span>"{searchValue}"</span>
                </div>
                <ReleasesSection sectionTitle="Альбомы" releases={albums} showAllProp={true}/>
            </Suspense>
        </>
    );
};
import styles from './index.module.scss';
import {useLocation, useNavigate} from "react-router";
import {lazy, Suspense, useCallback, useEffect, useReducer, } from "react";
import HeaderSkeleton from "../../shared/ui/Skeletons/HeaderSkeleton";
import ReleasesSectionSkeleton from "../../shared/ui/Skeletons/ReleasesSectionSkeleton";
import Skeleton from "react-loading-skeleton";
import {Release} from "../../entities/Release.ts";
import {searchReleases} from "../../processes/searchReleases.ts";

const Header = lazy(() => import("../../widgets/Header"));
const ReleasesSection = lazy(() => import("../../widgets/ReleasesSection"));

type StateType = {
    albums: [] | Release[];
    page: number;
    isLoading: boolean;
    isMoreLoading: boolean;
}

type ActionType = {
    type: string;
    newAlbums?: [] | Release[];
}

export const SearchPage = () => {
    const navigate = useNavigate();

    const initialState = {
        albums: [], page: 1, isLoading: true, isMoreLoading: false
    }

    const reducer = (state: StateType, action: ActionType) => {
        switch (action.type) {
            case 'INIT_VALUES':
                return { ...initialState };
            case 'LOAD_MORE':
                return { ...state, isMoreLoading: true };
            case 'FINALLY':
                return { ...state, isLoading: false, isMoreLoading: false };
            case 'ADD_DATA': {
                const existingUrls = new Set(state.albums.map(album => album.url || album.name));
                const newAlbums = action.newAlbums?.filter(album =>
                    !existingUrls.has(album.url || album.name) && album.image?.[0]?.['#text']
                );

                return {
                    ...state,
                    albums: [...state.albums, ...(newAlbums ?? [])],
                    page: state.page + 1
                };
            }
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchValue = searchParams.get("search");

    const scrollHandler = () => {
        if (document.documentElement.scrollHeight - (document.documentElement.scrollTop + window.innerHeight) < 500) {
            console.log('scroll');
            dispatch({type: 'LOAD_MORE'});
        }
    }

    const fetchData = useCallback(async (page: number) => {
        if (!searchValue || searchValue === "") {
            navigate('/');
            return
        }
        try {
            const queryString = encodeURIComponent(searchValue);
            const newAlbums = await searchReleases(queryString, page)
            dispatch({type: "ADD_DATA", newAlbums})
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            dispatch({type: 'FINALLY'});
        }
    }, [navigate, searchValue]);

    useEffect(() => {
        if (!searchValue) return;
        dispatch({type: 'INIT_VALUES'})

        fetchData(state.page);

        document.addEventListener('scroll', scrollHandler, {passive: true});

        return function ()  {
            document.removeEventListener('scroll', scrollHandler);
        }
    }, [fetchData, searchValue]);

    useEffect(() => {
        if (state.isMoreLoading) {
            fetchData(state.page);
        }
    }, [fetchData, state.isMoreLoading, state.page]);

    if (state.isLoading) {
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
                <ReleasesSection sectionTitle="Альбомы" releases={state.albums} showAllProp={true}/>
            </Suspense>
        </>
    );
};
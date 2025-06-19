import styles from "./index.module.scss";
import {AlbumInfo} from "../../widgets/AlbumInfo";
import {UserRatingContainer} from "../../widgets/UserRatingContainer";
import {UserReviews} from "../../widgets/UserReviews";
import {lazy, Suspense, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {fetchReleaseDataById} from "../../processes/fetchReleaseDataById.ts";
import HeaderSkeleton from "../../shared/ui/Skeletons/HeaderSkeleton";
import {ReleaseInfoType} from "../../entities/ReleaseInfoType.ts";

const Header = lazy(() => import("../../widgets/Header"));

export const AlbumPage = () => {
    const [release, setRelease] = useState<ReleaseInfoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { releaseId } = useParams<{ releaseId: string }>();

    useEffect(() => {
        const fetchFullReleaseData = async () => {
            try {
                setIsLoading(true);
                const response = await fetchReleaseDataById(releaseId);
                setRelease( {
                    title: response.title,
                    artist: response.artist,
                    releasePhoto: response.releasePhoto,
                    ratings: response.ratings || [],
                    reviews: response.reviews || [],
                })
            } catch (err) {
                console.error(err);
                navigate('/not-found');
            } finally {
                setIsLoading(false);
            }
        };

        (async () => {
            await fetchFullReleaseData();
        })();
    }, [releaseId, navigate]);

    if (isLoading || !release) {
        return (
            <>
                <HeaderSkeleton />
            </>
        );
    }

    return (
        <>
            <Suspense fallback={
                <>
                    <HeaderSkeleton />
                </>
            }>
                <Header />
                <main className={styles.mainAlbumPage}>
                    <AlbumInfo release={release} />
                    {releaseId && <UserRatingContainer releaseId={releaseId} />}
                    <UserReviews reviews={release.reviews} />
                </main>
            </Suspense>
        </>
    );
}
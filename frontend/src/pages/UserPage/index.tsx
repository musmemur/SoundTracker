import { Suspense, useEffect, useState, lazy } from "react";
import { useParams } from "react-router";
import { fetchFullUserData } from "../../processes/fetchFullUserData.ts";
import { ApiFullUserResponse } from "../../entities/ApiFullUserResponse.ts";
import { ReleaseWithRating } from "../../entities/ReleaseWithRating.ts";
import { fetchReleaseDataById } from "../../processes/fetchReleaseDataById.ts";
import { SavedRelease } from "../../entities/SavedRelease.ts";
import {UserPageSkeleton} from "./UserPageSkeleton.tsx";

const Header = lazy(() => import("../../widgets/Header"));
const UserCard = lazy(() => import("../../widgets/UserCard"));
const ReleasesSection = lazy(() => import("../../widgets/ReleasesSection"));

export const UserPage = () => {
    const { userId } = useParams<{ userId?: string }>();

    const [user, setUser] = useState<ApiFullUserResponse | null>(null);
    const [ratedReleases, setRatedReleases] = useState<ReleaseWithRating[] | []>([]);
    const [savedReleases, setSavedReleases] = useState<SavedRelease[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const userData = await fetchFullUserData(userId);
                setUser(userData);

                if (userData?.savedReleases) {
                    const releasesPromises = userData.savedReleases.map(release =>
                        fetchReleaseDataById(release.releaseId)
                    );

                    const releasesData = await Promise.all(releasesPromises);

                    const formattedReleases: SavedRelease[] = releasesData.map(release => ({
                        url: `SavedRelease: "${release.title}" by ${release.artist}`,
                        name: release.title,
                        artist: release.artist,
                        image: release.releasePhoto
                    })).reverse();

                    setSavedReleases(formattedReleases);
                }

                if (userData?.ratings) {
                    const releasesPromises = userData.ratings.map(rating =>
                        fetchReleaseDataById(rating.releaseId)
                    );
                    const releasesData = await Promise.all(releasesPromises);
                    const formattedReleases: ReleaseWithRating[] = releasesData.map((release, index) => ({
                        url: `RatedRelease: "${release.title}" by ${release.artist}`,
                        name: release.title,
                        artist: release.artist,
                        image: release.releasePhoto,
                        rating: userData.ratings[index].rating
                    })).reverse();

                    setRatedReleases(formattedReleases);
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        (async () => {
            await fetchUserData();
        })();
    }, [userId]);

    if (isLoading || !user) {
        return (
            <>
                <UserPageSkeleton />
            </>
        );
    }

    return(
        <>
            <Suspense fallback={
                <>
                    <UserPageSkeleton />
                </>
            }>
                <Header />
                <UserCard user={user} />
                <ReleasesSection sectionTitle="Понравившиеся релизы" releases={savedReleases}/>
                <ReleasesSection sectionTitle="Недавние оценки" releases={ratedReleases}/>
            </Suspense>
        </>
    )
}

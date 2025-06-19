import styles from './index.module.scss';
import {Link, useParams} from "react-router";
import React, {useEffect, useState} from "react";
import {User} from "../../entities/User.ts";
import {fetchUserData} from "../../processes/fetchUserData.ts";
import {fetchUserRating} from "../../processes/fetchUserRating.ts";
import {ReviewModal} from "../../entities/ReviewModal.ts";
import {ReleaseRating} from "../../shared/ui/ReleaseRating";

export type UserReviewProps = {
    review: ReviewModal;
}

export const UserReview: React.FC<UserReviewProps> = ({review}) => {
    const { releaseId } = useParams<{ releaseId: string }>();

    const [user, setUser] = useState<User | null>(null);
    const [ratingReview, setRating] = useState<number | null>(null);

    useEffect(() => {
        fetchUserData(review.userId)
            .then(setUser)
            .catch(() => setUser(null));

        if(releaseId) {
            fetchUserRating(releaseId, review.userId)
                .then(setRating)
                .catch(() => setRating(null));
        }
    }, [releaseId, review.userId]);

    if (!user) return <div>Загрузка...</div>;

    return (
        <div className={styles.userReviewInfo}>
            <div className={styles.userReviewInfoText}>
                <div>
                    <Link to={`/user/${user.userId}`}>
                        {user.username}
                    </Link>
                    {ratingReview && (
                        <ReleaseRating rating={ratingReview} />
                    )}
                </div>
                <div className={styles.userReviewText}>
                    {review.reviewText}
                </div>
            </div>
        </div>
    )
}
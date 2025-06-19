import styles from "./index.module.scss";
import releaseRatingStyles from '../../shared/ui/ReleaseRating/index.module.scss';
import {Link} from "react-router";
import likeButtonImg from "../../shared/assets/like.svg";
import likeClickedImg from "../../shared/assets/like(clicked).svg";
import {useEffect, useState, useRef} from "react";
import React from "react";
import {AppDispatch, RootState} from "../../app/store.ts";
import {useDispatch, useSelector} from "react-redux";
import {loadAuthUser} from "../../features/loadAuthUser.ts";
import {
    fetchUserInteraction,
    toggleSaveRelease,
    updateUserRating,
    updateUserReview
} from "../../features/userReleaseInteraction.ts";

interface UserRatingContainerProps {
    releaseId: string;
}

export const UserRatingContainer = ({releaseId}: UserRatingContainerProps) => {
    const [localReview, setLocalReview] = useState<string>("");
    const likeButtonRef = useRef<HTMLImageElement>(null);
    const dispatch: AppDispatch = useDispatch();
    const authUser = useSelector((state: RootState) => state.loadAuthUser.value);
    const interaction = useSelector((state: RootState) =>
        state.userReleaseInteraction.interactions[releaseId]);

    useEffect(() => {
        if (!authUser) {
            dispatch(loadAuthUser());
        }
    }, [authUser, dispatch]);

    useEffect(() => {
        if (authUser?.userId && releaseId) {
            dispatch(fetchUserInteraction(releaseId, authUser.userId));
        }
    }, [authUser?.userId, releaseId, dispatch]);

    useEffect(() => {
        if (interaction?.userReview !== undefined) {
            setLocalReview(interaction.userReview);
        }
    }, [interaction?.userReview]);

    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedRating = parseInt(e.target.value);
        if (authUser) {
            dispatch(updateUserRating(releaseId, selectedRating));
        }
    };

    const handleCancelRating = () => {
        if (authUser) {
            dispatch(updateUserRating(releaseId, null));
        }
    };

    const handleClickSaveReleaseButton = () => {
        if (authUser && interaction) {
            dispatch(toggleSaveRelease(releaseId, interaction.isSaved));
        }
    };

    const handleClickSaveReviewButton = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (authUser) {
            dispatch(updateUserReview(releaseId, localReview));
        }
    };

    const handleClickDeleteReview = () => {
        if (authUser) {
            dispatch(updateUserReview(releaseId, ''));
        }
    };

    return(
        <>
            {authUser && (
                <div className={styles.userRatingContainer}>
                    <div className={styles.userInfoTop}>
                        <div className={styles.userInfo}>
                            <div className={`${styles.profilePictureContainer} ${styles.userRatingProfilePictureContainer}`}>
                                <img src={authUser.userPhoto} className={styles.photoUserPlaceholder}
                                     alt="аватарка пользователя"/>
                            </div>
                            <div>
                                <Link to={`/user/${encodeURIComponent(authUser.userId)}`} className={styles.nickname}>
                                    {authUser?.username}
                                </Link>
                                <div className={styles.ratingContainer}>
                                    <div className={releaseRatingStyles.releaseRating}>
                                        {[5, 4, 3, 2, 1].map((value) => (
                                            <React.Fragment key={value}>
                                                <label>
                                                    {value}
                                                    <input
                                                        type="radio"
                                                        name="user-rating"
                                                        value={value}
                                                        id={`rating-${value}`}
                                                        checked={interaction?.userRating === value}
                                                        onChange={handleRatingChange}
                                                    />
                                                </label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    {interaction?.userRating && (
                                        <button type="button" className={styles.cancelRatingButton}
                                                onClick={handleCancelRating}>X</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <button className={styles.likeButton}>
                                <img
                                    src={interaction?.isSaved ? likeClickedImg : likeButtonImg}
                                    className={styles.userLike}
                                    ref={likeButtonRef}
                                    alt="Лайк"
                                    onClick={handleClickSaveReleaseButton}
                                />
                            </button>
                        </div>
                    </div>
                    <form className={styles.userReleaseReviewForm} onSubmit={handleClickSaveReviewButton}>
                        <textarea
                            className={styles.addReviewInput}
                            placeholder="Добавить рецензию"
                            value={localReview}
                            onChange={(e) => setLocalReview(e.target.value)}
                        />
                        <div className={styles.reviewButtonsContainer}>
                            {localReview && (
                                <button
                                    className={styles.deleteReviewButton}
                                    onClick={handleClickDeleteReview}
                                >
                                    удалить
                                </button>
                            )}
                            <button className={styles.saveUserChangesButton} type="submit">сохранить</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
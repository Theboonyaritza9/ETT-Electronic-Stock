import React from "react";
import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Backdrop from "../../Components/Backdrop/Backdrop";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import ModalAction from "../../Components/Modal/ModalAction";
import Slider from "../../Components/Slider/Slider";
import StatusText from "../../Components/Tag/StatusText";
import ToastList from "../../Components/Toast/ToastList";
import Title from "../../Components/Text/Title";
import Toast from "../../Components/Toast/Toast";
import ToolTable from "./Components/ToolTable";
import { getBoard, resetBoard } from "../../Redux/features/boardSlice";
import { checkStatus } from "../../utils";
import { catchError } from "../../utils/handleError";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";

import "./BoardDetail.css";

const warningText = [
  { text: "ประวัติการเบิกและเพิ่มบอร์ด", id: "t1" },
  { text: "ข้อมูลบอร์ดในหน้าอุปกรณ์ไม่ครบ", id: "t3" },
];

const toolTableElement = [
    { minW: "7", maxW: "10", name: "รูปภาพ" },
    { minW: "23", maxW: "25", name: "ชื่ออุปกรณ์" },
    { minW: "12", maxW: "15", name: "รหัสอุปกรณ์" },
    { minW: "15", maxW: "17", name: "ชนิด" },
    { minW: "15", maxW: "17", name: "ประเภท" },
    { minW: "10", maxW: "12", name: "ขนาด" },
    { minW: "14", maxW: "16", name: "จำนวนที่ใช้ในบอร์ด" },
    { minW: "13", maxW: "15", name: "อื่นๆ" },
  ];

const BoardDetail = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boardId = useParams().boardId;
  const board = useSelector((state) => state.board.board);
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    dispatch(getBoard(boardId));
    if (board) {
      let newImagesArr = [];
      if (board?.avatar?.url) {
        newImagesArr.unshift(board.avatar);
      }
      if (board?.images?.length > 0) {
        newImagesArr = [...newImagesArr, ...board.images];
      }
      if (newImagesArr.length > 0) {
        setPreviewImage(newImagesArr[0].url);
      } else {
        setPreviewImage("/images/avatars/user-2.jpg");
      }
      setImages(newImagesArr);
    }

    return () => {
      dispatch(resetBoard());
    };
  }, [dispatch, board, boardId]);

  const changedPreviewImg = (img, id) => {
    let imgElement = document.getElementById(id);
    let allImgs = document.querySelectorAll(".slider__img");

    allImgs.forEach((item) => {
      if (item.getAttribute("class").includes("active")) {
        item.classList.remove("active");
      }
    });
    imgElement.classList.add("active");
    setPreviewImage(img);
  };

  const handleModal = () => {
    setOpenModal((prev) => !prev);
  };

  const onSubmitDeleting = async (e) => {
    let mainElement = document.querySelector(".main");
    let menu = document.querySelectorAll(".sidebar__item");
    let newItemActive = document.getElementById("m2");
    e.preventDefault();

    try {
      dispatch(startLoading());
      await Axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/boards/${board._id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        menu.forEach((item) => {
          let isItemActive = item.getAttribute("class").includes("active");
          if (isItemActive) {
            item.classList.remove("active");
          }
        });

        newItemActive.classList.add("active");
        dispatch(endLoading());
        navigate("/boardList");
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      mainElement.scrollTo(0, 0);
    }

    setOpenModal(false);
  };

  if (!board) {
    return <div />;
  }

  return (
    <div className="itemDetail">
      <p className="u-mg-b">รายการบอร์ด : {board.boardName}</p>
      <Heading type="main" text="รายละเอียดบอร์ด" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      <div className="itemDetail__container">
        <div className="itemDetail__images-box">
          <img src={previewImage} alt="avatar" className="itemDetail__avatar" />
          <Slider id="tSlider" images={images} onClick={changedPreviewImg} />
        </div>
        <div className="itemDetail__content-box">
          <Title>{board.boardName}</Title>

          <article className="itemDetail__article">
            <div className="itemDetail__content">
              <p className="itemDetail__title">รหัสบอร์ด</p>
              <p className="itemDetail__text">{board.boardCode}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">จำนวนบอร์ด</p>
              <p className="itemDetail__text">{board.total}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">ชนิด</p>
              <p className="itemDetail__text">
                {board?.type ? board.type : "ไม่ได้กำหนด"}
              </p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">
                ค่าตัวเลขน้อยกว่าที่กำหนดจะมีการแจ้งเตือน
              </p>
              <p className="itemDetail__text">{board.limit}</p>
            </div>
            <div className="itemDetail__content">
              <p className="itemDetail__title">สถานะ</p>
              <StatusText
                className="itemDetail__tool-status"
                text={checkStatus(board).text}
                type={checkStatus(board).type}
              />
            </div>
            <div className="itemDetail__description">
              <p className="itemDetail__title">รายละเอียดเพิ่มเติม</p>
              <p className="itemDetail__text">{board.description}</p>
            </div>
          </article>

          <div className="btn__group">
            <Button
              element="link"
              type="button"
              path={`/boardList/${board._id}/update`}
              className="btn-primary-blue"
            >
              แก้ไข
            </Button>
            <Button
              element="button"
              type="button"
              className="btn-secondary-red"
              onClick={handleModal}
            >
              ลบ
            </Button>
            <Button
              element="link"
              type="button"
              path="/boardList"
              className="btn-primary-grey"
            >
              กลับ
            </Button>
          </div>
        </div>
      </div>

      {openModal && (
        <React.Fragment>
          <ModalAction
            title="ลบ"
            itemName={`บอร์ด ${board.boardName}`}
            onClick={handleModal}
          >
            <div className="modal__form">
              <ToastList
                element="error"
                type="light"
                message="การทำขั้นตอนนี้ข้อมูลที่เกี่ยวข้องจะถูกลบไปด้วย"
                article={warningText}
              />
              <div className="btn__group justify--left">
                <Button
                  type="button"
                  element="button"
                  className="btn-white"
                  onClick={handleModal}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  element="button"
                  className="btn-secondary-red"
                  onClick={onSubmitDeleting}
                >
                  ลบ
                </Button>
              </div>
            </div>
          </ModalAction>
          <Backdrop black style={{ zIndex: 100 }} />
        </React.Fragment>
      )}
      <ToolTable
        state={toolTableElement}
        data={board.tools}
      />
    </div>
  );
};

export default BoardDetail;

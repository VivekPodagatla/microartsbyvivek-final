// ================= MICROARTS POPUP STYLES =================

function PopupStyles() {
  return (
    <style>
      {`
          .microarts-toast {
            position: fixed;
            top: 96px;
            right: 24px;
            z-index: 12000;

            width: min(
              390px,
              calc(100vw - 32px)
            );

            display: flex;
            align-items: flex-start;
            gap: 12px;

            padding: 15px 16px;

            background: #fffdfb;
            border: 1px solid #eaded3;
            border-radius: 14px;

            box-shadow:
              0 16px 40px
              rgba(0, 0, 0, 0.16);

            animation:
              microartsToastIn
              0.22s ease-out;
          }

          .microarts-toast-success {
            border-left:
              5px solid #8b5e3c;
          }

          .microarts-toast-error {
            border-left:
              5px solid #b42318;
          }

          .microarts-toast-warning {
            border-left:
              5px solid #b7791f;
          }

          .microarts-toast-info {
            border-left:
              5px solid #667085;
          }

          .microarts-toast-icon {
            width: 32px;
            height: 32px;

            flex: 0 0 32px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: #f3eee9;
            color: #8b5e3c;

            font-size: 18px;
            font-weight: 800;
          }

          .microarts-toast-error
          .microarts-toast-icon {
            background: #fff0ee;
            color: #b42318;
          }

          .microarts-toast-warning
          .microarts-toast-icon {
            background: #fff7e8;
            color: #9a6700;
          }

          .microarts-toast-info
          .microarts-toast-icon {
            background: #f2f4f7;
            color: #475467;
          }

          .microarts-toast-content {
            flex: 1;
            min-width: 0;
          }

          .microarts-toast-content
          strong {
            display: block;

            margin-bottom: 3px;

            color: #1f1f1f;
            font-size: 15px;
            line-height: 1.3;
          }

          .microarts-toast-content
          p {
            margin: 0;

            color: #5e5e5e;
            font-size: 13px;
            line-height: 1.45;
          }

          .microarts-toast-close {
            width: 28px;
            height: 28px;

            flex: 0 0 28px;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 0;

            border: none;
            border-radius: 50%;

            background: transparent;
            color: #777777;

            font-size: 20px;
            line-height: 1;

            cursor: pointer;
          }

          .microarts-toast-close:hover {
            background: #f3eee9;
            color: #222222;
          }

          .microarts-confirm-overlay {
            position: fixed;
            inset: 0;
            z-index: 13000;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background:
              rgba(17, 17, 17, 0.48);

            backdrop-filter:
              blur(4px);
          }

          .microarts-confirm-card {
            width: min(
              440px,
              100%
            );

            padding: 28px;

            background: #fffdfb;
            border: 1px solid #eaded3;
            border-radius: 18px;

            box-shadow:
              0 24px 70px
              rgba(0, 0, 0, 0.24);

            animation:
              microartsDialogIn
              0.2s ease-out;
          }

          .microarts-confirm-symbol {
            width: 46px;
            height: 46px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 18px;

            border-radius: 50%;

            background: #f6eee8;
            color: #8b5e3c;

            font-size: 22px;
            font-weight: 800;
          }

          .microarts-confirm-card
          h2 {
            margin: 0 0 10px;

            color: #1f1f1f;
            font-size: 24px;
            line-height: 1.2;
          }

          .microarts-confirm-card
          p {
            margin: 0;

            color: #606060;
            font-size: 14px;
            line-height: 1.6;
          }

          .microarts-confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;

            margin-top: 24px;
          }

          .microarts-confirm-actions
          button {
            min-width: 100px;

            padding: 11px 16px;

            border-radius: 9px;

            font-weight: 700;
            cursor: pointer;
          }

          .microarts-confirm-cancel {
            border:
              1px solid #d8c5b5;

            background: #ffffff;
            color: #5b4637;
          }

          .microarts-confirm-cancel:hover {
            background: #f7f2ee;
          }

          .microarts-confirm-primary {
            border:
              1px solid #8b5e3c;

            background: #8b5e3c;
            color: #ffffff;
          }

          .microarts-confirm-primary:hover {
            background: #744b30;
          }

          .microarts-confirm-danger {
            border:
              1px solid #b42318;

            background: #b42318;
            color: #ffffff;
          }

          .microarts-confirm-danger:hover {
            background: #912018;
          }

          @keyframes
          microartsToastIn {
            from {
              opacity: 0;
              transform:
                translateY(-8px)
                translateX(10px);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                translateX(0);
            }
          }

          @keyframes
          microartsDialogIn {
            from {
              opacity: 0;
              transform:
                translateY(8px)
                scale(0.98);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }

          @media
          (max-width: 600px) {
            .microarts-toast {
              top: 74px;
              right: 16px;
              left: 16px;

              width: auto;
            }

            .microarts-confirm-card {
              padding: 22px;
            }

            .microarts-confirm-actions {
              flex-direction: column-reverse;
            }

            .microarts-confirm-actions
            button {
              width: 100%;
            }
          }
        `}
    </style>
  )
}

export default PopupStyles

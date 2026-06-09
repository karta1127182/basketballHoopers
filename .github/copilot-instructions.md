# Hoopers React Native 專案指南

## 專案概述
Hoopers 是一個使用 Expo 和 React Native 構建的行動應用程式專案。
- **框架**: React Native 0.85.3 + Expo 56.0.8
- **主要語言**: TypeScript / JavaScript
- **包管理器**: npm

## 專案結構
```
hoopers/
├── src/
│   ├── app/              # Expo Router 應用程式路由
│   ├── components/       # 可重用的 React 元件
│   ├── constants/        # 應用程式常數
│   ├── hooks/            # 自訂 React hooks
│   └── global.css        # 全域樣式
├── assets/               # 靜態資產 (圖片、字體等)
├── scripts/              # 實用指令碼
├── package.json          # 專案依賴和腳本
├── app.json              # Expo 配置
└── tsconfig.json         # TypeScript 設定
```

## 開發命令

### 啟動開發伺服器
- **Web**: `npm run web` - 在瀏覽器中執行應用程式
- **iOS**: `npm run ios` - 在 iOS 模擬器中執行 (需要 macOS)
- **Android**: `npm run android` - 在 Android 模擬器中執行

### 其他命令
- `npm start` - 啟動 Expo 開發伺服器
- `npm test` - 執行測試 (如果已設定)
- `npm run lint` - 執行程式碼檢查 (如果已設定)

## 開發工作流程

### 新增元件
1. 在 `src/components/` 中建立新的 `.tsx` 或 `.ts` 檔案
2. 實現 React 元件邏輯
3. 在其他元件或頁面中匯入並使用

### 新增路由
1. 在 `src/app/` 中建立新頁面文件
2. Expo Router 會自動處理路由配置
3. 使用 `expo-router` 的 `Link` 或 `useRouter` 進行導航

### 管理狀態
- 使用 React Hooks (`useState`, `useContext` 等)
- 或在 `src/hooks/` 中建立自訂 hooks
- 考慮使用 Context API 或狀態管理庫

## 依賴管理
- 安裝: `npm install <package-name>`
- 更新: `npm update`
- 移除: `npm uninstall <package-name>`

## 故障排除

### 清除快取
```powershell
npx expo start --clear
```

### 重新安裝依賴
```powershell
rm -r node_modules
npm install
```

### 查看詳細日誌
```powershell
npm run web -- --verbose
```

## 延伸閱讀
- [Expo 文件](https://docs.expo.dev)
- [React Native 文件](https://reactnative.dev)
- [Expo Router 文件](https://docs.expo.dev/routing/introduction)

---

**專案建立日期**: 2026年6月1日

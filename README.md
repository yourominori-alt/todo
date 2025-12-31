# TODO App

React + TypeScript + Viteで構築されたモダンなTODO管理アプリケーションです。

![TODO App](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-4.4-646CFF)

## 機能

### 基本機能
- ✅ **CRUD操作** - TODOの追加、編集、削除、表示
- ✅ **完了管理** - TODOの完了/未完了の切り替え
- ✅ **データ永続化** - localStorageを使用した自動保存

### 高度な機能
- 🎯 **優先度管理** - 3段階の優先度（高・中・低）を色分け表示
- 📅 **期限管理** - 期限設定と期限切れ警告
- 🏷️ **カテゴリ管理** - カスタムカテゴリの作成と色分け
- 🔖 **タグ機能** - 複数タグによる分類
- 🔍 **検索機能** - タイトルと説明の全文検索
- 🎛️ **フィルタリング** - カテゴリ、優先度、完了状態でフィルタ
- 🔄 **ソート機能** - 作成日、期限、優先度で並び替え

## デモ

### 優先度の色分け
- **高**: 赤色で表示（緊急タスク）
- **中**: 黄色で表示（通常タスク）
- **低**: 緑色で表示（低優先度タスク）

### 期限警告
- **期限切れ**: 赤色の警告表示
- **今日まで**: オレンジ色の警告表示
- **3日以内**: 黄色の警告表示

## インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd todo

# 依存パッケージのインストール
npm install
```

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### ビルド

```bash
npm run build
```

ビルド成果物は `dist` ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
```

ビルドされたアプリケーションをプレビューします。

## プロジェクト構造

```
todo/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── TodoForm/        # TODO追加・編集フォーム
│   │   ├── TodoItem/        # 個別TODO表示
│   │   ├── TodoList/        # TODOリスト表示
│   │   ├── TodoFilter/      # フィルタ・検索UI
│   │   └── CategoryManager/ # カテゴリ管理
│   ├── context/             # React Context (状態管理)
│   │   ├── TodoContext.tsx  # Contextプロバイダー
│   │   └── TodoReducer.ts   # Reducerロジック
│   ├── types/               # TypeScript型定義
│   │   └── todo.ts          # データ型
│   ├── utils/               # ユーティリティ関数
│   │   └── localStorage.ts  # localStorage操作
│   ├── App.tsx              # メインアプリ
│   └── main.tsx             # エントリーポイント
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **CSS Modules** - スコープ付きスタイリング
- **Context API + useReducer** - グローバル状態管理
- **localStorage** - データ永続化

## データモデル

```typescript
interface Todo {
  id: string;              // UUID
  title: string;           // タイトル（必須）
  description?: string;    // 説明（任意）
  completed: boolean;      // 完了状態
  priority: 'low' | 'medium' | 'high';  // 優先度
  dueDate?: string;        // 期限（ISO 8601形式）
  category?: string;       // カテゴリ
  tags: string[];          // タグ配列
  createdAt: string;       // 作成日時
  updatedAt: string;       // 更新日時
}
```

## 使い方の例

### 1. TODOの追加
1. 上部のフォームにタイトルを入力
2. 必要に応じて説明、優先度、期限、カテゴリ、タグを設定
3. 「追加」ボタンをクリック

### 2. カテゴリの作成
1. 「カテゴリ管理」セクションでカテゴリ名を入力
2. カラーピッカーで色を選択
3. 「追加」ボタンをクリック

### 3. フィルタリング
1. 「フィルタ・検索」セクションで条件を設定
2. 検索ボックスでテキスト検索
3. カテゴリや優先度でフィルタ
4. 並び替え順序を選択

### 4. TODOの編集
1. TODOアイテムの「編集」ボタンをクリック
2. フォームが編集モードになります
3. 内容を変更して「更新」ボタンをクリック

## ブラウザサポート

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## ライセンス

MIT

## 開発

このプロジェクトは Claude Code で作成されました。

### 今後の改善案
- [ ] ダークモード対応
- [ ] エクスポート/インポート機能
- [ ] ドラッグ&ドロップでの並び替え
- [ ] リマインダー機能
- [ ] サブタスク機能

# Localwave

Localwave is a Vue.js application that provides information about various local markets in Seoul. Users can explore different markets, search for specific stores or products, and view detailed information about local businesses on an interactive map.

## Features

- Interactive map of Seoul using Naver Maps API
- Search for local markets, stores, and products
- Filter businesses by category
- Dark mode toggle
- Responsive design for mobile and desktop
- Current location detection
- Paginated listing of local businesses

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Supabase account and project set up
- Naver Maps API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/localwave.git
   ```

2. Navigate to the project directory:
   ```
   cd localwave
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
   ```

## Usage

To run the development server:

```
npm run dev
```

To build the project for production:

```
npm run build
```

## Components

- `LocalwaveMap`: The main component that integrates all other components.
- `FloatingButtons`: Contains buttons for opening Seoul Pay and toggling dark mode.
- `MarketList`: Displays the list of local markets and handles search functionality.
- `MapView`: Renders the Naver Map and handles map-related operations.
- `MobileBottomSheet`: A mobile-friendly bottom sheet for filtering options.

## Contributing

Contributions to Localwave are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project uses the following license: [MIT License](LICENSE).

## Contact

If you want to contact the maintainer, you can reach out at [rakddh@gmail.com](mailto:rakddh@gmail.com).

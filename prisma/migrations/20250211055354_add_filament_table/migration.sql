-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costPerCubicMM" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Filament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filament_name_key" ON "Filament"("name");
